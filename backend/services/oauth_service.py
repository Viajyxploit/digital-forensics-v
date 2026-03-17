from google.oauth2 import id_token
from google.auth.transport import requests
import os
from typing import Optional

class GoogleOAuthService:
    def __init__(self):
        self.client_id = os.environ.get('GOOGLE_CLIENT_ID')
        self.client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')
    
    def verify_google_token(self, token: str) -> Optional[dict]:
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                requests.Request(), 
                self.client_id
            )
            
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return {
                'email': idinfo['email'],
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'sub': idinfo['sub']
            }
        except ValueError:
            return None

oauth_service = GoogleOAuthService()