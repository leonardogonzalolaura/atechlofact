interface GoogleAuthResponse {
  access_token: string;
  id_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export const googleAuthService = {
  async exchangeCodeForToken(code: string): Promise<GoogleAuthResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: window.location.origin + '/auth/google/callback'
      })
    });

    if (!response.ok) {
      throw new Error('Error intercambiando código por token');
    }

    return response.json();
  },

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo información del usuario');
    }

    return response.json();
  },

  async registerWithGoogle(googleUser: GoogleUserInfo) {
    // Registrar usuario usando la API existente
    return await fetch('https://tools.apis.atechlo.com/apisunat/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.email,
        username: googleUser.email.split('@')[0], // Usar parte del email como username
        password: 'google_oauth_' + googleUser.id, // Password temporal para OAuth
        company_id: null,
        google_id: googleUser.id,
        profile_picture: googleUser.picture
      })
    });
  }
};