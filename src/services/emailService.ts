interface WelcomeEmailData {
  email: string;
  username: string;
  trial_end_date: string;
}

export const emailService = {
  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<void> {
    try {
      const emailContent = {
        to: userData.email,
        from: 'noreply@atechlo.com',
        subject: '¡Bienvenido a AtechloFact! - Tu cuenta trial está lista',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a AtechloFact!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hola ${userData.username},</h2>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                ¡Tu cuenta en AtechloFact ha sido creada exitosamente! Estamos emocionados de tenerte como parte de nuestra comunidad.
              </p>
              
              <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
                <h3 style="color: #1976d2; margin-top: 0;">🎉 Tu cuenta Trial está activa</h3>
                <p style="color: #333; margin: 10px 0;"><strong>Usuario:</strong> ${userData.username}</p>
                <p style="color: #333; margin: 10px 0;"><strong>Plan:</strong> Trial Gratuito</p>
                <p style="color: #333; margin: 10px 0;"><strong>Válido hasta:</strong> ${new Date(userData.trial_end_date).toLocaleDateString('es-PE')}</p>
              </div>
              
              <h3 style="color: #333;">¿Qué puedes hacer con AtechloFact?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>✅ Crear facturas electrónicas profesionales</li>
                <li>✅ Gestionar clientes y productos</li>
                <li>✅ Generar reportes detallados</li>
                <li>✅ Consultar DNI y RUC automáticamente</li>
                <li>✅ Exportar documentos en PDF</li>
                <li>✅ Cumplir con normativas SUNAT</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          font-weight: bold; 
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                  🚀 Comenzar Ahora
                </a>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>💡 Consejo:</strong> Durante tu período trial, explora todas las funcionalidades para aprovechar al máximo AtechloFact.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              
              <p style="color: #999; font-size: 14px; text-align: center;">
                Si tienes alguna pregunta, no dudes en contactarnos.<br>
                <strong>AtechloFact</strong> - Sistema de Facturación Electrónica<br>
                © 2024 Atechlo. Todos los derechos reservados.
              </p>
            </div>
          </div>
        `
      };

      // Enviar email usando EmailJS desde el frontend
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'service_atechlo',
          template_id: 'template_welcome', 
          user_id: 'YOUR_EMAILJS_USER_ID',
          template_params: {
            to_email: userData.email,
            from_name: 'AtechloFact',
            to_name: userData.username,
            username: userData.username,
            trial_end_date: new Date(userData.trial_end_date).toLocaleDateString('es-PE'),
            login_url: typeof window !== 'undefined' ? window.location.origin : 'https://atechlo.github.io/atechlofact',
            html_content: emailContent.html
          }
        })
      });

    } catch (error) {
      console.error('Error enviando email de bienvenida:', error);
      // No lanzar error para no interrumpir el registro
    }
  }
};