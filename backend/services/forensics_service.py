import hashlib
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
import os
from datetime import datetime, timezone
from typing import Dict, Any, List
import struct

class ForensicsService:
    def analyze_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        analysis = {
            'filename': filename,
            'file_size': len(file_content),
            'hashes': self._calculate_hashes(file_content),
            'file_type': self._detect_file_type(file_content),
            'metadata': self._extract_metadata(file_content, filename),
            'hex_preview': self._generate_hex_preview(file_content),
            'strings': self._extract_strings(file_content),
            'entropy': self._calculate_entropy(file_content),
            'threat_analysis': self._analyze_threats(file_content),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        return analysis
    
    def _calculate_hashes(self, content: bytes) -> Dict[str, str]:
        return {
            'md5': hashlib.md5(content).hexdigest(),
            'sha1': hashlib.sha1(content).hexdigest(),
            'sha256': hashlib.sha256(content).hexdigest(),
            'sha512': hashlib.sha512(content).hexdigest()
        }
    
    def _detect_file_type(self, content: bytes) -> Dict[str, str]:
        if MAGIC_AVAILABLE:
            try:
                mime = magic.Magic(mime=True)
                mime_type = mime.from_buffer(content)
                return {
                    'mime_type': mime_type,
                    'description': self._get_file_description(mime_type)
                }
            except:
                pass
        
        # Fallback: detect by magic bytes
        mime_type = self._detect_by_magic_bytes(content)
        return {
            'mime_type': mime_type,
            'description': self._get_file_description(mime_type)
        }
    
    def _detect_by_magic_bytes(self, content: bytes) -> str:
        if not content:
            return 'application/octet-stream'
        
        # Common file signatures
        if content[:2] == b'MZ':
            return 'application/x-msdownload'
        elif content[:4] == b'%PDF':
            return 'application/pdf'
        elif content[:2] == b'PK':
            return 'application/zip'
        elif content[:4] == b'\x89PNG':
            return 'image/png'
        elif content[:3] == b'\xFF\xD8\xFF':
            return 'image/jpeg'
        elif content[:4] == b'GIF8':
            return 'image/gif'
        else:
            # Check if it's text
            try:
                content[:512].decode('utf-8')
                return 'text/plain'
            except:
                return 'application/octet-stream'
    
    def _get_file_description(self, mime_type: str) -> str:
        descriptions = {
            'application/x-msdownload': 'Windows Executable',
            'application/x-executable': 'Linux Executable',
            'application/pdf': 'PDF Document',
            'application/zip': 'ZIP Archive',
            'text/plain': 'Text File',
            'image/jpeg': 'JPEG Image',
            'image/png': 'PNG Image'
        }
        return descriptions.get(mime_type, 'Binary File')
    
    def _extract_metadata(self, content: bytes, filename: str) -> Dict[str, Any]:
        return {
            'created': datetime.now(timezone.utc).isoformat(),
            'modified': datetime.now(timezone.utc).isoformat(),
            'extension': os.path.splitext(filename)[1],
            'magic_bytes': content[:16].hex() if len(content) >= 16 else content.hex()
        }
    
    def _generate_hex_preview(self, content: bytes, max_bytes: int = 512) -> List[Dict[str, str]]:
        hex_lines = []
        preview_content = content[:max_bytes]
        
        for i in range(0, len(preview_content), 16):
            chunk = preview_content[i:i+16]
            offset = f'{i:08x}'
            hex_bytes = ' '.join(f'{b:02x}' for b in chunk)
            ascii_repr = ''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)
            
            hex_lines.append({
                'offset': offset,
                'hex': hex_bytes,
                'ascii': ascii_repr
            })
        
        return hex_lines
    
    def _extract_strings(self, content: bytes, min_length: int = 4) -> List[str]:
        strings = []
        current_string = []
        
        for byte in content[:2048]:  # Limit to first 2KB
            if 32 <= byte < 127:
                current_string.append(chr(byte))
            else:
                if len(current_string) >= min_length:
                    strings.append(''.join(current_string))
                current_string = []
        
        return strings[:50]  # Return top 50 strings
    
    def _calculate_entropy(self, content: bytes) -> float:
        if not content:
            return 0.0
        
        byte_counts = [0] * 256
        for byte in content[:8192]:  # Sample first 8KB
            byte_counts[byte] += 1
        
        entropy = 0.0
        length = len(content[:8192])
        
        for count in byte_counts:
            if count > 0:
                probability = count / length
                entropy -= probability * (probability.bit_length() - 1)
        
        return round(entropy, 2)
    
    def _analyze_threats(self, content: bytes) -> Dict[str, Any]:
        threat_level = 'low'
        findings = []
        
        # Check entropy (high entropy might indicate encryption/packing)
        entropy = self._calculate_entropy(content)
        if entropy > 7.5:
            threat_level = 'medium'
            findings.append('High entropy detected - file may be packed or encrypted')
        
        # Check for suspicious strings
        strings = self._extract_strings(content)
        suspicious_keywords = ['cmd', 'powershell', 'exec', 'eval', 'system', 'shell']
        
        for keyword in suspicious_keywords:
            if any(keyword.lower() in s.lower() for s in strings):
                threat_level = 'high'
                findings.append(f'Suspicious keyword found: {keyword}')
                break
        
        # Check file size (unusually large files)
        if len(content) > 10 * 1024 * 1024:  # 10MB
            findings.append('Large file size detected')
        
        if not findings:
            findings.append('No immediate threats detected')
            findings.append('File structure appears normal')
        
        return {
            'threat_level': threat_level,
            'findings': findings,
            'entropy_score': entropy
        }

forensics_service = ForensicsService()