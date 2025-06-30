package com.greenloop.greenloop.email;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class WelcomeEmailListener {

    final private EmailService emailService;

    public WelcomeEmailListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @EventListener
    @Async
    public void sendWelcomeEmail(WelcomeEmailEvent welcomeEmailEvent) {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Error while sending email", e);
        }

        String htmlContent = createWelcomeEmailTemplate(welcomeEmailEvent.getName());
        emailService.sendHtmlEmail(
                welcomeEmailEvent.getEmail(),
                "Bienvenido a GreenLoop",
                htmlContent
        );
    }

    private String createWelcomeEmailTemplate(String name) {
        return "<!DOCTYPE html>" +
                "<html lang='es'>" +
                "<head>" +
                "  <meta charset='UTF-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <style>" +
                "    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5; color: #333; }" +
                "    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }" +
                "    .header { background: linear-gradient(135deg, #3dae58 0%, #2a9745 100%); padding: 25px 20px; text-align: center; }" +
                "    .logo { margin-bottom: 15px; }" +
                "    .logo img { width: 120px; height: auto; }" +
                "    .header h1 { color: #ffffff; font-weight: 600; margin: 0; font-size: 26px; }" +
                "    .content { padding: 30px; background-color: #ffffff; }" +
                "    .welcome-message { font-size: 18px; margin-bottom: 25px; }" +
                "    .name { color: #2a9745; font-weight: 600; }" +
                "    .feature-box { background-color: #f9f9f9; border-left: 4px solid #2a9745; padding: 15px; margin: 20px 0; border-radius: 4px; }" +
                "    .feature-title { font-weight: 600; margin-top: 0; color: #2a9745; }" +
                "    .feature-list { padding-left: 20px; }" +
                "    .feature-list li { margin-bottom: 8px; }" +
                "    .btn-container { text-align: center; margin: 35px 0 25px; }" +
                "    .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #3dae58 0%, #2a9745 100%); " +
                "      color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; " +
                "      box-shadow: 0 4px 8px rgba(42,151,69,0.2); transition: all 0.3s ease; }" +
                "    .button:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(42,151,69,0.3); }" +
                "    .signature { margin-top: 30px; }" +
                "    .divider { height: 1px; background-color: #eaeaea; margin: 30px 0; }" +
                "    .footer { padding: 20px; background-color: #f9f9f9; text-align: center; }" +
                "    .social-links { margin-bottom: 15px; }" +
                "    .social-icon { display: inline-block; margin: 0 8px; }" +
                "    .copyright { font-size: 13px; color: #888; margin-top: 10px; }" +
                "    @media only screen and (max-width: 480px) {" +
                "      .container { width: 100%; border-radius: 0; }" +
                "      .content { padding: 20px; }" +
                "    }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <div class='logo'><!-- Logo placeholder -->" +
                "        <svg width='120' height='40' viewBox='0 0 120 40' fill='none' xmlns='http://www.w3.org/2000/svg'>" +
                "          <rect width='120' height='40' rx='4' fill='white' fill-opacity='0.2'/>" +
                "          <path d='M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20Z' fill='white'/>" +
                "          <path d='M45 15H95V25H45V15Z' fill='white' fill-opacity='0.7'/>" +
                "        </svg>" +
                "      </div>" +
                "      <h1>¡Bienvenido a GreenLoop!</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='welcome-message'>" +
                "        <p>Hola <span class='name'>" + name + "</span>,</p>" +
                "        <p>¡Nos alegra mucho darte la bienvenida a la comunidad GreenLoop! Tu decisión de unirte a nosotros " +
                "        marca el inicio de un viaje hacia un futuro más sostenible y respetuoso con el medio ambiente.</p>" +
                "      </div>" +
                "      <div class='feature-box'>" +
                "        <h3 class='feature-title'>Tu viaje comienza aquí</h3>" +
                "        <ul class='feature-list'>" +
                "          <li>Personaliza tu perfil y comparte tus intereses ecológicos</li>" +
                "          <li>Descubre y participa en iniciativas de sostenibilidad</li>" +
                "          <li>Conecta con otros miembros apasionados por el planeta</li>" +
                "          <li>Aprende y comparte consejos para un estilo de vida más verde</li>" +
                "        </ul>" +
                "      </div>" +
                "      <div class='btn-container'>" +
                "        <a href='#' class='button'>Explorar GreenLoop</a>" +
                "      </div>" +
                "      <div class='signature'>" +
                "        <p>Contamos con tu participación para crear juntos un impacto positivo,</p>" +
                "        <p>El equipo de GreenLoop 🌱</p>" +
                "      </div>" +
                "    </div>" +
                "    <div class='divider'></div>" +
                "    <div class='footer'>" +
                "      <div class='social-links'>" +
                "        <!-- Social Icons -->" +
                "        <span class='social-icon'>📱</span>" +
                "        <span class='social-icon'>📘</span>" +
                "        <span class='social-icon'>📸</span>" +
                "        <span class='social-icon'>📺</span>" +
                "      </div>" +
                "      <p>¿Preguntas? Responde a este correo o contáctanos en <a href='mailto:soporte@greenloop.com'>soporte@greenloop.com</a></p>" +
                "      <p class='copyright'>© 2024 GreenLoop. Todos los derechos reservados.</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}