interface WelcomeEmailData {
  email: string;
  username: string;
  trial_end_date: string;
}

export const emailService = {
  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<void> {
    try {
      const response = await fetch('https://tools.apis.atechlo.com/apisunat/trial-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          username: userData.username,
          trial_end_date: userData.trial_end_date
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando email de bienvenida');
      }

      console.log('Email de bienvenida enviado exitosamente');

    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      // No lanzar error para no interrumpir el registro
    }
  }
};