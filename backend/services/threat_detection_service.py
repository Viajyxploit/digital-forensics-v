from typing import List, Dict, Any
from datetime import datetime, timezone
import random

class ThreatDetectionService:
    def __init__(self):
        self.threat_patterns = self._load_threat_patterns()
        self.anomaly_threshold = 0.7
    
    def _load_threat_patterns(self) -> Dict[str, List[str]]:
        return {
            'malware_signatures': [
                'trojan', 'ransomware', 'backdoor', 'rootkit', 'keylogger'
            ],
            'network_attacks': [
                'ddos', 'port_scan', 'brute_force', 'sql_injection', 'xss'
            ],
            'suspicious_ips': [
                '192.168.1.100', '10.0.0.50', '172.16.0.200'
            ],
            'suspicious_domains': [
                'malicious-site.com', 'phishing-example.net'
            ]
        }
    
    def analyze_network_traffic(self, traffic_data: Dict[str, Any]) -> Dict[str, Any]:
        threats = []
        severity = 'low'
        
        # Check for suspicious IP patterns
        if traffic_data.get('source_ip') in self.threat_patterns['suspicious_ips']:
            threats.append({
                'type': 'suspicious_ip',
                'description': f"Known malicious IP: {traffic_data.get('source_ip')}",
                'severity': 'high'
            })
            severity = 'high'
        
        # Check for port scanning
        if traffic_data.get('port_scan_detected'):
            threats.append({
                'type': 'port_scan',
                'description': 'Port scanning activity detected',
                'severity': 'medium'
            })
            severity = 'medium' if severity == 'low' else severity
        
        # Check for unusual traffic volume
        if traffic_data.get('packet_count', 0) > 10000:
            threats.append({
                'type': 'high_volume',
                'description': 'Unusually high traffic volume detected',
                'severity': 'medium'
            })
        
        return {
            'threats_detected': len(threats),
            'overall_severity': severity,
            'threat_details': threats,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'recommendation': self._get_recommendation(severity)
        }
    
    def analyze_file_behavior(self, file_hash: str, behavior_data: Dict[str, Any]) -> Dict[str, Any]:
        threats = []
        severity = 'low'
        
        # Check for suspicious system calls
        suspicious_calls = ['CreateRemoteThread', 'WriteProcessMemory', 'VirtualAllocEx']
        if any(call in behavior_data.get('system_calls', []) for call in suspicious_calls):
            threats.append({
                'type': 'suspicious_api_calls',
                'description': 'Suspicious Windows API calls detected',
                'severity': 'high'
            })
            severity = 'high'
        
        # Check for registry modifications
        if behavior_data.get('registry_modifications'):
            threats.append({
                'type': 'registry_modification',
                'description': 'Unauthorized registry modifications detected',
                'severity': 'medium'
            })
            severity = 'medium' if severity == 'low' else severity
        
        # Check for network connections
        if behavior_data.get('external_connections'):
            threats.append({
                'type': 'external_connection',
                'description': 'File attempting external network connections',
                'severity': 'high'
            })
            severity = 'high'
        
        return {
            'file_hash': file_hash,
            'threats_detected': len(threats),
            'overall_severity': severity,
            'threat_details': threats,
            'is_malicious': severity in ['high', 'critical'],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def detect_anomalies(self, baseline_data: Dict[str, float], current_data: Dict[str, float]) -> Dict[str, Any]:
        anomalies = []
        
        for metric, baseline_value in baseline_data.items():
            current_value = current_data.get(metric, 0)
            deviation = abs(current_value - baseline_value) / (baseline_value + 0.001)
            
            if deviation > self.anomaly_threshold:
                anomalies.append({
                    'metric': metric,
                    'baseline': baseline_value,
                    'current': current_value,
                    'deviation': round(deviation * 100, 2),
                    'severity': 'high' if deviation > 1.5 else 'medium'
                })
        
        return {
            'anomalies_detected': len(anomalies),
            'anomaly_details': anomalies,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'requires_investigation': len(anomalies) > 0
        }
    
    def generate_threat_report(self, time_period: str = '24h') -> Dict[str, Any]:
        # Simulate threat statistics
        return {
            'time_period': time_period,
            'total_threats': random.randint(50, 200),
            'critical_threats': random.randint(1, 5),
            'high_threats': random.randint(5, 20),
            'medium_threats': random.randint(20, 50),
            'low_threats': random.randint(20, 125),
            'threats_blocked': random.randint(45, 180),
            'threats_by_category': {
                'malware': random.randint(10, 50),
                'phishing': random.randint(5, 30),
                'ddos': random.randint(2, 10),
                'intrusion_attempts': random.randint(15, 60),
                'data_exfiltration': random.randint(1, 5)
            },
            'top_threat_sources': [
                {'ip': '192.168.1.100', 'count': 45},
                {'ip': '10.0.0.50', 'count': 32},
                {'ip': '172.16.0.200', 'count': 28}
            ],
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
    
    def _get_recommendation(self, severity: str) -> str:
        recommendations = {
            'critical': 'Immediate action required. Isolate affected systems and contact security team.',
            'high': 'Investigate immediately. Block suspicious traffic and monitor closely.',
            'medium': 'Review and monitor. Consider implementing additional security measures.',
            'low': 'Continue monitoring. No immediate action required.'
        }
        return recommendations.get(severity, 'Monitor situation')

threat_detection_service = ThreatDetectionService()