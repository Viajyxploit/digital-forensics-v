from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json
import base64
from fastapi.responses import Response
from services.forensics_service import forensics_service
from services.certificate_service import certificate_service
from services.threat_detection_service import threat_detection_service
from services.lab_service import lab_service
from services.oauth_service import oauth_service

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'super_secret_jwt_key')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str = "student"
    created_at: str

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    level: str
    duration: str
    modules_count: int
    color: str
    icon: str
    image_url: str
    progress: int = 0

class Module(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    course_id: str
    title: str
    content: str
    video_url: Optional[str] = None
    duration: str
    order: int
    completed: bool = False

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    module_id: str
    question: str
    options: List[str]
    correct_answer: int

class ThreatAlert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    severity: str
    description: str
    timestamp: str
    status: str = "active"

class ForensicFile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    filename: str
    file_size: int
    file_type: str
    analysis: Optional[Dict[str, Any]] = None
    uploaded_at: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ProgressUpdate(BaseModel):
    module_id: str
    completed: bool

class GoogleOAuthRequest(BaseModel):
    token: str

class QuizQuestion(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    module_id: str
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: List[int]

class QuizResult(BaseModel):
    quiz_id: str
    score: int
    total_questions: int
    passed: bool
    answers: List[Dict[str, Any]]

class LabTaskSubmission(BaseModel):
    lab_id: str
    task_id: int
    answer: Any

class LabProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    lab_id: str
    completed_tasks: List[int]
    score: int
    started_at: str
    completed_at: Optional[str] = None
    completed: bool

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed.decode('utf-8'),
        "role": "student",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    token = create_token(user_id, user_data.email)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": "student"
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    
    return {
        "token": token,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "role": user['role']
        }
    }

@api_router.get("/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@api_router.get("/courses", response_model=List[Course])
async def get_courses(payload: dict = Depends(verify_token)):
    courses = await db.courses.find({}, {"_id": 0}).to_list(100)
    user_progress = await db.progress.find({"user_id": payload['user_id']}, {"_id": 0}).to_list(1000)
    
    progress_map = {}
    for p in user_progress:
        course_id = p.get('course_id')
        if course_id not in progress_map:
            progress_map[course_id] = []
        if p.get('completed'):
            progress_map[course_id].append(p.get('module_id'))
    
    for course in courses:
        course_id = course['id']
        completed = len(progress_map.get(course_id, []))
        total = course.get('modules_count', 1)
        course['progress'] = int((completed / total) * 100) if total > 0 else 0
    
    return courses

@api_router.get("/courses/{course_id}/modules", response_model=List[Module])
async def get_course_modules(course_id: str, payload: dict = Depends(verify_token)):
    modules = await db.modules.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    user_progress = await db.progress.find({"user_id": payload['user_id'], "course_id": course_id}, {"_id": 0}).to_list(100)
    
    completed_modules = {p['module_id'] for p in user_progress if p.get('completed')}
    
    for module in modules:
        module['completed'] = module['id'] in completed_modules
    
    return modules

@api_router.post("/progress")
async def update_progress(progress: ProgressUpdate, payload: dict = Depends(verify_token)):
    module = await db.modules.find_one({"id": progress.module_id}, {"_id": 0})
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    progress_doc = {
        "user_id": payload['user_id'],
        "course_id": module['course_id'],
        "module_id": progress.module_id,
        "completed": progress.completed,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.progress.update_one(
        {"user_id": payload['user_id'], "module_id": progress.module_id},
        {"$set": progress_doc},
        upsert=True
    )
    
    return {"message": "Progress updated"}

@api_router.get("/threats", response_model=List[ThreatAlert])
async def get_threats(payload: dict = Depends(verify_token)):
    threats = await db.threats.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    return threats

@api_router.post("/forensics/upload")
async def upload_file(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    file_id = str(uuid.uuid4())
    content = await file.read()
    
    analysis = {
        "file_size": len(content),
        "file_type": file.content_type,
        "hash_md5": "simulated_md5_hash",
        "hash_sha256": "simulated_sha256_hash",
        "metadata": {
            "created": datetime.now(timezone.utc).isoformat(),
            "modified": datetime.now(timezone.utc).isoformat()
        },
        "threat_level": "low",
        "findings": [
            "No malicious patterns detected",
            "File structure is valid",
            "Metadata analysis complete"
        ]
    }
    
    file_doc = {
        "id": file_id,
        "user_id": payload['user_id'],
        "filename": file.filename,
        "file_size": len(content),
        "file_type": file.content_type,
        "analysis": analysis,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.forensic_files.insert_one(file_doc)

@api_router.post("/auth/google")
async def google_oauth_login(oauth_request: GoogleOAuthRequest):
    user_info = oauth_service.verify_google_token(oauth_request.token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    user = await db.users.find_one({"email": user_info['email']}, {"_id": 0})
    
    if not user:
        user_id = str(uuid.uuid4())
        user_doc = {
            "id": user_id,
            "email": user_info['email'],
            "name": user_info['name'],
            "picture": user_info.get('picture', ''),
            "role": "student",
            "auth_provider": "google",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        token = create_token(user_id, user_info['email'])
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": user_info['email'],
                "name": user_info['name'],
                "role": "student"
            }
        }
    else:
        token = create_token(user['id'], user['email'])
        return {
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "role": user['role']
            }
        }

@api_router.post("/forensics/upload-advanced")
async def upload_file_advanced(file: UploadFile = File(...), payload: dict = Depends(verify_token)):
    file_id = str(uuid.uuid4())
    content = await file.read()
    
    analysis = forensics_service.analyze_file(content, file.filename)
    
    file_doc = {
        "id": file_id,
        "user_id": payload['user_id'],
        "filename": file.filename,
        "file_size": len(content),
        "file_type": analysis['file_type']['mime_type'],
        "analysis": analysis,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.forensic_files.insert_one(file_doc)
    
    return {
        "id": file_id,
        "filename": file.filename,
        "analysis": analysis
    }

@api_router.get("/forensics/hex-view/{file_id}")
async def get_hex_view(file_id: str, payload: dict = Depends(verify_token)):
    file_doc = await db.forensic_files.find_one({"id": file_id, "user_id": payload['user_id']}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    return {
        "file_id": file_id,
        "filename": file_doc['filename'],
        "hex_data": file_doc['analysis'].get('hex_preview', [])
    }

@api_router.get("/modules/{module_id}/quiz")
async def get_module_quiz(module_id: str, payload: dict = Depends(verify_token)):
    quizzes = await db.quizzes.find({"module_id": module_id}, {"_id": 0}).to_list(20)
    return quizzes

@api_router.post("/quiz/submit")
async def submit_quiz(submission: QuizSubmission, payload: dict = Depends(verify_token)):
    quizzes = await db.quizzes.find({"id": submission.quiz_id}, {"_id": 0}).to_list(1)
    if not quizzes:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz = quizzes[0]
    questions = await db.quiz_questions.find({"quiz_id": submission.quiz_id}, {"_id": 0}).to_list(100)
    
    correct_count = 0
    results = []
    
    for idx, question in enumerate(questions):
        user_answer = submission.answers[idx] if idx < len(submission.answers) else -1
        is_correct = user_answer == question['correct_answer']
        if is_correct:
            correct_count += 1
        
        results.append({
            "question": question['question'],
            "user_answer": user_answer,
            "correct_answer": question['correct_answer'],
            "is_correct": is_correct,
            "explanation": question.get('explanation', '')
        })
    
    score = int((correct_count / len(questions)) * 100) if questions else 0
    passed = score >= 70
    
    quiz_result_doc = {
        "id": str(uuid.uuid4()),
        "user_id": payload['user_id'],
        "quiz_id": submission.quiz_id,
        "score": score,
        "total_questions": len(questions),
        "correct_answers": correct_count,
        "passed": passed,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.quiz_results.insert_one(quiz_result_doc)
    
    return {
        "quiz_id": submission.quiz_id,
        "score": score,
        "total_questions": len(questions),
        "passed": passed,
        "answers": results
    }

@api_router.get("/certificate/{course_id}")
async def get_certificate(course_id: str, payload: dict = Depends(verify_token)):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    user_progress = await db.progress.find({
        "user_id": payload['user_id'],
        "course_id": course_id,
        "completed": True
    }, {"_id": 0}).to_list(1000)
    
    modules_completed = len(user_progress)
    total_modules = course.get('modules_count', 0)
    
    if modules_completed < total_modules:
        raise HTTPException(
            status_code=400, 
            detail=f"Course not completed. {modules_completed}/{total_modules} modules done."
        )
    
    certificate_id = str(uuid.uuid4())
    completion_date = datetime.now(timezone.utc).strftime("%B %d, %Y")
    
    pdf_content = certificate_service.generate_certificate(
        user_name=user['name'],
        course_title=course['title'],
        completion_date=completion_date,
        certificate_id=certificate_id,
        modules_completed=modules_completed
    )
    
    cert_doc = {
        "id": certificate_id,
        "user_id": payload['user_id'],
        "course_id": course_id,
        "issued_at": datetime.now(timezone.utc).isoformat()
    }
    await db.certificates.insert_one(cert_doc)
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=certificate_{course_id}.pdf"
        }
    )

@api_router.get("/threats/advanced")
async def get_advanced_threats(payload: dict = Depends(verify_token)):
    report = threat_detection_service.generate_threat_report('24h')
    return report

@api_router.post("/threats/analyze-network")
async def analyze_network_traffic(traffic_data: Dict[str, Any], payload: dict = Depends(verify_token)):
    analysis = threat_detection_service.analyze_network_traffic(traffic_data)
    
    if analysis['overall_severity'] in ['high', 'critical']:
        threat_doc = {
            "id": str(uuid.uuid4()),
            "title": "Network Threat Detected",
            "severity": analysis['overall_severity'],
            "description": f"Detected {analysis['threats_detected']} threats in network traffic",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "active",
            "details": analysis
        }
        await db.threats.insert_one(threat_doc)
    
    return analysis

@api_router.get("/courses/{course_id}/labs")
async def get_course_labs(course_id: str, payload: dict = Depends(verify_token)):
    labs = lab_service.get_course_labs(course_id)
    return labs

@api_router.get("/labs/{lab_type}/{lab_id}")
async def get_lab_scenario(lab_type: str, lab_id: str, payload: dict = Depends(verify_token)):
    scenario = lab_service.get_lab_scenario(lab_type, lab_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Lab scenario not found")
    return scenario

@api_router.post("/labs/start")
async def start_lab(lab_id: str, payload: dict = Depends(verify_token)):
    progress_doc = {
        "id": str(uuid.uuid4()),
        "user_id": payload['user_id'],
        "lab_id": lab_id,
        "completed_tasks": [],
        "score": 0,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None
    }
    await db.lab_progress.insert_one(progress_doc)
    return {"message": "Lab started", "progress_id": progress_doc["id"]}

@api_router.post("/labs/submit-task")
async def submit_lab_task(submission: LabTaskSubmission, payload: dict = Depends(verify_token)):
    validation = lab_service.validate_lab_task(
        submission.lab_id,
        submission.task_id,
        submission.answer
    )
    
    # Update progress
    progress = await db.lab_progress.find_one({
        "user_id": payload['user_id'],
        "lab_id": submission.lab_id
    }, {"_id": 0})
    
    if progress:
        if submission.task_id not in progress['completed_tasks']:
            progress['completed_tasks'].append(submission.task_id)
            progress['score'] += validation.get('points', 0)
            
            await db.lab_progress.update_one(
                {"user_id": payload['user_id'], "lab_id": submission.lab_id},
                {"$set": {
                    "completed_tasks": progress['completed_tasks'],
                    "score": progress['score']
                }}
            )
    
    return {
        "correct": validation['correct'],
        "feedback": validation['feedback'],
        "points_earned": validation.get('points', 0),
        "total_score": progress['score'] if progress else 0
    }

@api_router.post("/labs/{lab_id}/complete")
async def complete_lab(lab_id: str, payload: dict = Depends(verify_token)):
    await db.lab_progress.update_one(
        {"user_id": payload['user_id'], "lab_id": lab_id},
        {"$set": {"completed_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Lab completed"}

@api_router.get("/labs/{lab_id}/progress")
async def get_lab_progress(lab_id: str, payload: dict = Depends(verify_token)):
    progress = await db.lab_progress.find_one({
        "user_id": payload['user_id'],
        "lab_id": lab_id
    }, {"_id": 0})
    
    if not progress:
        return {"started": False}
    
    return {
        "started": True,
        "completed_tasks": progress.get('completed_tasks', []),
        "score": progress.get('score', 0),
        "completed": progress.get('completed_at') is not None
    }

@api_router.post("/threats/analyze-file-behavior")
async def analyze_file_behavior(
    file_hash: str,
    behavior_data: Dict[str, Any],
    payload: dict = Depends(verify_token)
):
    analysis = threat_detection_service.analyze_file_behavior(file_hash, behavior_data)
    return analysis

    
    return {
        "id": file_id,
        "filename": file.filename,
        "analysis": analysis
    }

@api_router.get("/forensics/files", response_model=List[ForensicFile])
async def get_forensic_files(payload: dict = Depends(verify_token)):
    files = await db.forensic_files.find({"user_id": payload['user_id']}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return files

@api_router.post("/ai/chat", response_model=ChatResponse)
async def chat_with_ai(chat_msg: ChatMessage, payload: dict = Depends(verify_token)):
    session_id = chat_msg.session_id or str(uuid.uuid4())
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message="You are CyberSentinel AI, an expert digital forensics and cybersecurity assistant. Help users learn about forensics, analyze threats, and understand security concepts. Be professional, precise, and educational."
    ).with_model("openai", "gpt-5.2")
    
    user_message = UserMessage(text=chat_msg.message)
    response = await chat.send_message(user_message)
    
    chat_doc = {
        "session_id": session_id,
        "user_id": payload['user_id'],
        "message": chat_msg.message,
        "response": response,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_history.insert_one(chat_doc)
    
    return ChatResponse(response=response, session_id=session_id)

@api_router.get("/stats")
async def get_stats(payload: dict = Depends(verify_token)):
    user_progress = await db.progress.find({"user_id": payload['user_id'], "completed": True}, {"_id": 0}).to_list(1000)
    files_count = await db.forensic_files.count_documents({"user_id": payload['user_id']})
    threats_count = await db.threats.count_documents({"status": "active"})
    
    return {
        "completed_modules": len(user_progress),
        "uploaded_files": files_count,
        "active_threats": threats_count,
        "learning_streak": 7
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

@app.on_event("startup")
async def init_db():
    courses_exist = await db.courses.count_documents({})    
    if courses_exist == 0:
        sample_courses = [
            {
                "id": "course-1",
                "title": "Digital Forensics Fundamentals",
                "description": "Master the basics of digital forensics, evidence collection, and chain of custody",
                "level": "Beginner",
                "duration": "4 weeks",
                "modules_count": 8,
                "color": "cyan-core",
                "icon": "Shield",
                "image_url": "https://images.unsplash.com/photo-1573166717911-d3625658b6f7?q=80&w=1000"
            },
            {
                "id": "course-2",
                "title": "Network Security & Threat Analysis",
                "description": "Learn to detect, analyze, and respond to network security threats",
                "level": "Intermediate",
                "duration": "6 weeks",
                "modules_count": 10,
                "color": "neon-red",
                "icon": "Activity",
                "image_url": "https://images.unsplash.com/photo-1558494949-efc52728101c?q=80&w=1000"
            },
            {
                "id": "course-3",
                "title": "Malware Analysis & Reverse Engineering",
                "description": "Deep dive into malware behavior, analysis techniques, and reverse engineering",
                "level": "Advanced",
                "duration": "8 weeks",
                "modules_count": 12,
                "color": "electric-violet",
                "icon": "Bug",
                "image_url": "https://images.unsplash.com/flagged/photo-1579274216947-86eaa4b00475?q=80&w=1000"
            },
            {
                "id": "course-4",
                "title": "Incident Response & Recovery",
                "description": "Develop skills to respond to security incidents and recover systems",
                "level": "Intermediate",
                "duration": "5 weeks",
                "modules_count": 9,
                "color": "solar-orange",
                "icon": "AlertTriangle",
                "image_url": "https://images.unsplash.com/photo-1642775196125-38a9eb496568?q=80&w=1000"
            }
        ]
        await db.courses.insert_many(sample_courses)
        
        sample_modules = [
            {
                "id": "mod-1",
                "course_id": "course-1",
                "title": "Introduction to Digital Forensics",
                "content": "Digital forensics is the process of uncovering and interpreting electronic data for legal purposes. This module covers the fundamental concepts, methodologies, and tools used in modern digital forensics investigations.",
                "video_url": "https://www.youtube.com/watch?v=example",
                "duration": "45 min",
                "order": 1
            },
            {
                "id": "mod-2",
                "course_id": "course-1",
                "title": "Evidence Collection & Preservation",
                "content": "Learn the critical steps of collecting and preserving digital evidence while maintaining chain of custody. Understand best practices for evidence handling and documentation.",
                "duration": "60 min",
                "order": 2
            }
        ]
        await db.modules.insert_many(sample_modules)
        
        sample_threats = [
            {
                "id": str(uuid.uuid4()),
                "title": "Suspicious Network Activity Detected",
                "severity": "high",
                "description": "Multiple failed login attempts from IP 192.168.1.100",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Malware Signature Match",
                "severity": "critical",
                "description": "Known malware pattern detected in uploaded file sample.exe",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Unauthorized Access Attempt",
                "severity": "medium",
                "description": "Access attempt to restricted resource from unknown device",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "status": "active"
            }
        ]
        await db.threats.insert_many(sample_threats)
        
        # Add sample quizzes
        quizzes_exist = await db.quiz_questions.count_documents({})
        if quizzes_exist == 0:
            sample_quiz_questions = [
                {
                    "id": str(uuid.uuid4()),
                    "module_id": "mod-1",
                    "quiz_id": "quiz-1",
                    "question": "What is the primary goal of digital forensics?",
                    "options": [
                        "To hack into systems",
                        "To uncover and interpret electronic data for legal purposes",
                        "To create malware",
                        "To encrypt data"
                    ],
                    "correct_answer": 1,
                    "explanation": "Digital forensics focuses on uncovering and interpreting electronic data for legal and investigative purposes."
                },
                {
                    "id": str(uuid.uuid4()),
                    "module_id": "mod-1",
                    "quiz_id": "quiz-1",
                    "question": "Which of the following is essential in digital forensics?",
                    "options": [
                        "Deleting evidence",
                        "Chain of custody",
                        "Hiding data",
                        "Formatting drives"
                    ],
                    "correct_answer": 1,
                    "explanation": "Chain of custody is critical to maintain the integrity and admissibility of digital evidence."
                },
                {
                    "id": str(uuid.uuid4()),
                    "module_id": "mod-2",
                    "quiz_id": "quiz-2",
                    "question": "What should be done first when collecting digital evidence?",
                    "options": [
                        "Turn off the computer",
                        "Document the scene and create a forensic image",
                        "Delete temporary files",
                        "Install new software"
                    ],
                    "correct_answer": 1,
                    "explanation": "Documentation and creating forensic images preserves evidence without alteration."
                }
            ]
            await db.quiz_questions.insert_many(sample_quiz_questions)