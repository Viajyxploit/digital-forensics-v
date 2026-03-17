import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Quiz = ({ moduleId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const loadQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/modules/${moduleId}/quiz`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data);
      setAnswers(new Array(response.data.length).fill(-1));
      setQuizStarted(true);
    } catch (error) {
      console.error('Failed to load quiz', error);
      toast.error('Failed to load quiz');
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/quiz/submit`,
        { quiz_id: questions[0]?.quiz_id || 'quiz-1', answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(response.data);
      if (response.data.passed && onComplete) {
        onComplete();
      }
      toast.success(response.data.passed ? 'Quiz passed!' : 'Keep practicing!');
    } catch (error) {
      console.error('Failed to submit quiz', error);
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  if (!quizStarted) {
    return (
      <motion.div
        className="glass-panel p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        data-testid="quiz-intro"
      >
        <Award className="w-16 h-16 text-laser-yellow mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          MODULE QUIZ
        </h3>
        <p className="text-gray-400 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Test your knowledge and earn your certification
        </p>
        <motion.button
          onClick={loadQuiz}
          className="px-8 py-3 bg-laser-yellow text-black font-bold hover:bg-white transition-colors"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="start-quiz-btn"
        >
          START QUIZ
        </motion.button>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div
        className="glass-panel p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        data-testid="quiz-results"
      >
        <div className="text-center mb-8">
          {result.passed ? (
            <CheckCircle className="w-20 h-20 text-acid-lime mx-auto mb-4" />
          ) : (
            <XCircle className="w-20 h-20 text-neon-red mx-auto mb-4" />
          )}
          <h3 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {result.passed ? 'QUIZ PASSED!' : 'KEEP TRYING!'}
          </h3>
          <p className="text-2xl text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Score: {result.score}%
          </p>
        </div>

        <div className="space-y-4">
          {result.answers.map((answer, idx) => (
            <div
              key={idx}
              className={`p-4 border-l-4 ${
                answer.is_correct ? 'border-acid-lime bg-acid-lime/10' : 'border-neon-red bg-neon-red/10'
              }`}
            >
              <p className="font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Q{idx + 1}: {answer.question}
              </p>
              {!answer.is_correct && (
                <p className="text-sm text-gray-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {answer.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="glass-panel p-8" data-testid="quiz-questions">
      <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        QUIZ
      </h3>
      
      <div className="space-y-8">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="space-y-4">
            <p className="text-lg font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {qIdx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oIdx) => (
                <motion.button
                  key={oIdx}
                  onClick={() => {
                    const newAnswers = [...answers];
                    newAnswers[qIdx] = oIdx;
                    setAnswers(newAnswers);
                  }}
                  className={`w-full p-4 text-left border transition-all ${
                    answers[qIdx] === oIdx
                      ? 'border-cyan-core bg-cyan-core/20'
                      : 'border-white/10 hover:border-cyan-core/50'
                  }`}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <motion.button
        onClick={submitQuiz}
        disabled={loading || answers.includes(-1)}
        className="w-full mt-8 py-3 bg-electric-violet text-white font-bold hover:bg-cyan-core transition-colors disabled:opacity-50"
        style={{ fontFamily: 'Rajdhani, sans-serif' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid="submit-quiz-btn"
      >
        {loading ? 'SUBMITTING...' : 'SUBMIT QUIZ'}
      </motion.button>
    </div>
  );
};

export default Quiz;