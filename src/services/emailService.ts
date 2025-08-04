import { withApiErrorHandling } from '../utils/apiWrapper';
import { WelcomeEmailData } from './emailTypes';

export const emailService = {
  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<void> {
    try {
      await withApiErrorHandling(async () => {
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
      });
    } catch (error: any) {
      console.error('Error enviando email de bienvenida:', error.message);
      // No lanzar error para no interrumpir el registro
    }
  }
};