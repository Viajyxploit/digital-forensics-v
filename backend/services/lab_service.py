from typing import Dict, Any, List
from datetime import datetime, timezone
import random
import uuid

class LabService:
    def __init__(self):
        self.lab_scenarios = self._initialize_scenarios()
    
    def _initialize_scenarios(self) -> Dict[str, Any]:
        return {
            'digital_forensics': self._create_forensics_scenarios(),
            'network_security': self._create_network_scenarios(),
            'incident_response': self._create_incident_scenarios(),
            'malware_analysis': self._create_malware_scenarios()
        }
    
    def _create_forensics_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'forensics-lab-1',
                'title': 'Evidence Collection & Chain of Custody',
                'description': 'Analyze a compromised file system and collect evidence',
                'difficulty': 'beginner',
                'file_system': {
                    'root': {
                        'name': '/',
                        'type': 'directory',
                        'children': [
                            {
                                'name': 'Documents',
                                'type': 'directory',
                                'children': [
                                    {'name': 'confidential.txt', 'type': 'file', 'size': 2048, 'modified': '2024-01-15 14:30:00', 'hash': 'a1b2c3d4e5f6', 'suspicious': True},
                                    {'name': 'report.pdf', 'type': 'file', 'size': 51200, 'modified': '2024-01-14 09:15:00', 'hash': 'f6e5d4c3b2a1', 'suspicious': False}
                                ]
                            },
                            {
                                'name': 'System',
                                'type': 'directory',
                                'children': [
                                    {'name': 'malware.exe', 'type': 'file', 'size': 8192, 'modified': '2024-01-16 03:22:00', 'hash': 'deadbeef1234', 'suspicious': True, 'hidden': True},
                                    {'name': 'registry.dat', 'type': 'file', 'size': 102400, 'modified': '2024-01-10 12:00:00', 'hash': '9876543210ab', 'suspicious': False}
                                ]
                            },
                            {
                                'name': 'Users',
                                'type': 'directory',
                                'children': [
                                    {'name': 'access.log', 'type': 'file', 'size': 4096, 'modified': '2024-01-16 15:45:00', 'hash': 'log123456789', 'suspicious': True}
                                ]
                            }
                        ]
                    }
                },
                'tasks': [
                    {'id': 1, 'description': 'Identify all suspicious files in the system', 'type': 'identification'},
                    {'id': 2, 'description': 'Calculate and verify MD5 hashes for suspicious files', 'type': 'verification'},
                    {'id': 3, 'description': 'Document the chain of custody for collected evidence', 'type': 'documentation'},
                    {'id': 4, 'description': 'Create a timeline of file modifications', 'type': 'analysis'}
                ],
                'evidence_items': ['confidential.txt', 'malware.exe', 'access.log']
            }
        ]
    
    def _create_network_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'network-lab-1',
                'title': 'Network Traffic Analysis & Threat Detection',
                'description': 'Analyze network packets to identify malicious activity',
                'difficulty': 'intermediate',
                'traffic_capture': [
                    {'timestamp': '2024-01-16 10:00:01', 'source_ip': '192.168.1.100', 'dest_ip': '8.8.8.8', 'protocol': 'DNS', 'size': 64, 'threat': False},
                    {'timestamp': '2024-01-16 10:00:05', 'source_ip': '192.168.1.100', 'dest_ip': '93.184.216.34', 'protocol': 'HTTP', 'size': 512, 'threat': False},
                    {'timestamp': '2024-01-16 10:00:12', 'source_ip': '192.168.1.100', 'dest_ip': '185.220.101.50', 'protocol': 'TCP', 'port': 4444, 'size': 1024, 'threat': True, 'type': 'C2_COMMUNICATION'},
                    {'timestamp': '2024-01-16 10:00:15', 'source_ip': '192.168.1.100', 'dest_ip': '185.220.101.50', 'protocol': 'TCP', 'port': 4444, 'size': 2048, 'threat': True, 'type': 'DATA_EXFILTRATION'},
                    {'timestamp': '2024-01-16 10:00:20', 'source_ip': '203.0.113.10', 'dest_ip': '192.168.1.100', 'protocol': 'TCP', 'port': 22, 'size': 128, 'threat': True, 'type': 'BRUTE_FORCE'},
                    {'timestamp': '2024-01-16 10:00:25', 'source_ip': '192.168.1.100', 'dest_ip': '1.1.1.1', 'protocol': 'HTTPS', 'size': 256, 'threat': False}
                ],
                'tasks': [
                    {'id': 1, 'description': 'Identify all suspicious IP addresses', 'type': 'identification'},
                    {'id': 2, 'description': 'Detect C2 (Command & Control) communications', 'type': 'threat_detection'},
                    {'id': 3, 'description': 'Analyze data exfiltration attempts', 'type': 'analysis'},
                    {'id': 4, 'description': 'Recommend firewall rules to block threats', 'type': 'mitigation'}
                ],
                'threat_ips': ['185.220.101.50', '203.0.113.10']
            }
        ]
    
    def _create_incident_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'incident-lab-1',
                'title': 'Ransomware Attack Investigation',
                'description': 'Investigate a ransomware incident and plan recovery',
                'difficulty': 'advanced',
                'timeline': [
                    {'time': '08:00', 'event': 'Normal system operations', 'severity': 'info'},
                    {'time': '08:15', 'event': 'Suspicious email opened by user@company.com', 'severity': 'warning'},
                    {'time': '08:17', 'event': 'Unknown process "crypt.exe" started', 'severity': 'critical'},
                    {'time': '08:18', 'event': 'Mass file encryption detected in C:/Users/', 'severity': 'critical'},
                    {'time': '08:20', 'event': 'Ransom note created: README_DECRYPT.txt', 'severity': 'critical'},
                    {'time': '08:22', 'event': 'Network share encryption in progress', 'severity': 'critical'},
                    {'time': '08:25', 'event': 'System logs tampered', 'severity': 'critical'}
                ],
                'system_logs': [
                    {'timestamp': '08:17:30', 'level': 'ERROR', 'source': 'FileSystem', 'message': 'Unauthorized file access: C:/Users/Documents/'},
                    {'timestamp': '08:18:00', 'level': 'CRITICAL', 'source': 'Security', 'message': 'Malicious process detected: crypt.exe'},
                    {'timestamp': '08:18:15', 'level': 'ERROR', 'source': 'FileSystem', 'message': 'File extension change: .docx -> .encrypted'},
                    {'timestamp': '08:20:00', 'level': 'ALERT', 'source': 'Security', 'message': 'Ransom note detected'},
                    {'timestamp': '08:22:00', 'level': 'CRITICAL', 'source': 'Network', 'message': 'Suspicious outbound connection to 185.220.101.50:8080'}
                ],
                'tasks': [
                    {'id': 1, 'description': 'Identify the attack vector (initial compromise)', 'type': 'investigation'},
                    {'id': 2, 'description': 'Map the complete attack timeline', 'type': 'analysis'},
                    {'id': 3, 'description': 'Isolate infected systems', 'type': 'containment'},
                    {'id': 4, 'description': 'Identify C2 server and block communications', 'type': 'mitigation'},
                    {'id': 5, 'description': 'Plan recovery strategy', 'type': 'recovery'}
                ],
                'correct_actions': ['isolate_system', 'block_c2', 'restore_from_backup', 'patch_vulnerability']
            }
        ]
    
    def _create_malware_scenarios(self) -> List[Dict[str, Any]]:
        return [
            {
                'id': 'malware-lab-1',
                'title': 'Malware Behavioral Analysis',
                'description': 'Analyze malware behavior in a safe sandbox environment',
                'difficulty': 'advanced',
                'sample_info': {
                    'filename': 'suspicious.exe',
                    'size': 8192,
                    'md5': 'deadbeef1234567890abcdef',
                    'sha256': 'a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890',
                    'file_type': 'PE32 executable'
                },
                'static_analysis': {
                    'imports': ['kernel32.dll', 'ws2_32.dll', 'advapi32.dll'],
                    'strings': ['http://malicious-c2.com', 'GET_SYSTEM_INFO', 'ENCRYPT_FILES', 'admin123'],
                    'sections': ['.text', '.data', '.rsrc'],
                    'packer': 'UPX v3.96'
                },
                'dynamic_analysis': {
                    'behaviors': [
                        {'action': 'File Creation', 'target': 'C:/Windows/Temp/payload.dll', 'threat_level': 'high'},
                        {'action': 'Registry Modification', 'target': 'HKLM/Software/Microsoft/Windows/CurrentVersion/Run', 'threat_level': 'high'},
                        {'action': 'Network Connection', 'target': 'malicious-c2.com:443', 'threat_level': 'critical'},
                        {'action': 'Process Injection', 'target': 'explorer.exe', 'threat_level': 'critical'},
                        {'action': 'Keylogging', 'target': 'System-wide', 'threat_level': 'critical'}
                    ],
                    'network_traffic': [
                        {'type': 'DNS', 'query': 'malicious-c2.com'},
                        {'type': 'HTTPS', 'connection': '185.220.101.50:443', 'data_sent': '2048 bytes'}
                    ]
                },
                'tasks': [
                    {'id': 1, 'description': 'Analyze static properties and identify suspicious imports', 'type': 'static_analysis'},
                    {'id': 2, 'description': 'Extract embedded strings and URLs', 'type': 'string_extraction'},
                    {'id': 3, 'description': 'Observe malware behavior in sandbox', 'type': 'dynamic_analysis'},
                    {'id': 4, 'description': 'Identify persistence mechanisms', 'type': 'persistence_detection'},
                    {'id': 5, 'description': 'Create detection signatures (YARA rules)', 'type': 'signature_creation'}
                ],
                'malware_family': 'Generic RAT (Remote Access Trojan)'
            }
        ]
    
    def get_lab_scenario(self, lab_type: str, lab_id: str) -> Dict[str, Any]:
        scenarios = self.lab_scenarios.get(lab_type, [])
        for scenario in scenarios:
            if scenario['id'] == lab_id:
                return scenario
        return None
    
    def validate_lab_task(self, lab_id: str, task_id: int, user_answer: Any) -> Dict[str, Any]:
        # Validation logic for different task types
        return {
            'correct': True,  # Simplified for now
            'feedback': 'Great job! Task completed successfully.',
            'points': 10
        }
    
    def get_course_labs(self, course_id: str) -> List[Dict[str, Any]]:
        lab_mapping = {
            'course-1': self.lab_scenarios['digital_forensics'],
            'course-2': self.lab_scenarios['network_security'],
            'course-3': self.lab_scenarios['malware_analysis'],
            'course-4': self.lab_scenarios['incident_response']
        }
        return lab_mapping.get(course_id, [])

lab_service = LabService()