import React from "react";
import { Link } from "react-router-dom";
import { MainLayout, PageContainer } from "@components/layout";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <MainLayout>
      <PageContainer className="py-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <Link 
            to="/register" 
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium mb-6"
          >
            <ArrowLeft size={20} />
            Volver al registro
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Política de Privacidad
          </h1>

          <div className="prose prose-pink max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Información que Recopilamos</h2>
              <p>
                En Home Nannies recopilamos la siguiente información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Información de registro:</strong> nombre de usuario, correo electrónico, contraseña</li>
                <li><strong>Información de perfil:</strong> nombre, foto, ubicación, experiencia, tarifas</li>
                <li><strong>Información de uso:</strong> reservas, favoritos, reseñas</li>
                <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, dispositivo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Cómo Usamos tu Información</h2>
              <p>
                Utilizamos tu información para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Facilitar la conexión entre padres y niñeras</li>
                <li>Verificar la identidad de los usuarios</li>
                <li>Procesar reservas y comunicaciones</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Enviar notificaciones importantes sobre tu cuenta</li>
                <li>Cumplir con requisitos legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Compartir Información</h2>
              <p>
                Tu información puede ser compartida con:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Otros usuarios:</strong> tu perfil es visible para usuarios registrados</li>
                <li><strong>Proveedores de servicios:</strong> empresas que nos ayudan a operar la plataforma</li>
                <li><strong>Autoridades:</strong> cuando sea requerido por ley</li>
              </ul>
              <p className="mt-3">
                No vendemos tu información personal a terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Seguridad de Datos</h2>
              <p>
                Implementamos medidas de seguridad para proteger tu información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cifrado de contraseñas</li>
                <li>Conexiones HTTPS seguras</li>
                <li>Tokens de autenticación JWT</li>
                <li>Verificación de correo electrónico</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Tus Derechos</h2>
              <p>
                Tienes derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a tu información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de tu cuenta</li>
                <li>Exportar tus datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y almacenamiento local para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Retención de Datos</h2>
              <p>
                Conservamos tu información mientras tu cuenta esté activa o según sea necesario para 
                proporcionar nuestros servicios. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Menores de Edad</h2>
              <p>
                Nuestros servicios están dirigidos a usuarios mayores de 18 años. No recopilamos 
                intencionalmente información de menores de edad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Cambios a esta Política</h2>
              <p>
                Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre 
                cambios significativos a través de correo electrónico o mediante un aviso en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Contacto</h2>
              <p>
                Para preguntas sobre esta política de privacidad o para ejercer tus derechos, contáctanos en:<br />
                <a href="mailto:privacy@homenannies.com" className="text-pink-600 hover:underline">
                  privacy@homenannies.com
                </a>
              </p>
            </section>

            <p className="text-sm text-gray-500 mt-8">
              Última actualización: 22 de noviembre de 2025
            </p>
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
}
