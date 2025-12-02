import React from "react";
import { Link } from "react-router-dom";
import { MainLayout, PageContainer } from "@components/layout";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
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
            Términos y Condiciones de Uso
          </h1>

          <div className="prose prose-pink max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Aceptación de Términos</h2>
              <p>
                Al acceder y utilizar Home Nannies, aceptas cumplir con estos términos y condiciones de uso. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Descripción del Servicio</h2>
              <p>
                Home Nannies es una plataforma que conecta a padres con niñeras calificadas. Facilitamos 
                la búsqueda, contacto y contratación de servicios de cuidado infantil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Registro de Cuenta</h2>
              <p>
                Para utilizar nuestros servicios, debes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar información precisa y actualizada</li>
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>Verificar tu correo electrónico</li>
                <li>Ser mayor de 18 años</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Responsabilidades del Usuario</h2>
              <p>
                Los usuarios se comprometen a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usar la plataforma de manera legal y responsable</li>
                <li>No compartir información falsa o engañosa</li>
                <li>Respetar a otros usuarios de la comunidad</li>
                <li>Cumplir con todas las leyes aplicables</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Verificación de Antecedentes</h2>
              <p>
                Las niñeras registradas pueden someterse a verificaciones de antecedentes. Sin embargo, 
                Home Nannies no garantiza la exactitud completa de esta información y recomienda a los 
                padres realizar sus propias verificaciones adicionales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Pagos y Tarifas</h2>
              <p>
                Los acuerdos financieros se establecen directamente entre padres y niñeras. Home Nannies 
                no procesa pagos en esta versión de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Limitación de Responsabilidad</h2>
              <p>
                Home Nannies actúa como intermediario y no se hace responsable de las acciones, conductas 
                o servicios prestados por las niñeras. Los padres son responsables de supervisar y evaluar 
                la idoneidad de los cuidadores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios 
                entrarán en vigor inmediatamente después de su publicación en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contacto</h2>
              <p>
                Para preguntas sobre estos términos, contáctanos en: <br />
                <a href="mailto:support@homenannies.com" className="text-pink-600 hover:underline">
                  support@homenannies.com
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
