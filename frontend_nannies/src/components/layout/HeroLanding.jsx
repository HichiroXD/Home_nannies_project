import { useNavigate } from "react-router-dom";
import { Shield, Search, MessageCircle, CheckCircle, Users, Clock, Heart, Award } from "lucide-react";

export default function HeroLanding() {
  const navigate = useNavigate();

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pink-50 via-white to-pink-100 py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Una forma de cuidar más adaptable a tu entorno,{" "}
                <span className="text-pink-600">Home Nannies.</span>
              </h1>
              <p className="text-lg text-gray-700">
                Una manera de encontrar profesionales al cuidado que se adapten a la 
                disponibilidad de tus estudios laborales.
              </p>
              <p className="text-base text-gray-600">
                <strong>¿Te gustaría que tu disponibilidad fuese menos raspada/distendida 
                por las exigencias del cuidado de tu pequeño hijo o hija?</strong>
              </p>
              <button
                onClick={() => navigate("/register")}
                className="px-8 py-3 bg-pink-500 text-white text-lg font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-md"
              >
                Empezar a encontrar
              </button>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-200 to-pink-300 rounded-3xl p-8 shadow-xl">
                <div className="bg-white rounded-2xl p-6 text-center">
                  <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-white rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-24 h-24 mx-auto text-pink-500 mb-4" />
                      <p className="text-2xl font-bold text-gray-800">Universidad O'Higgins</p>
                      <p className="text-pink-600 font-semibold mt-2">UOH</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-pink-50 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Niñeras Verificadas</h3>
              <p className="text-gray-600">
                Verifica la identidad de todas las niñeras de nuestro catálogo.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Búsqueda Personalizada</h3>
              <p className="text-gray-600">
                Encuentra la niñera basándote en tus necesidades y horarios.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Comunicación Directa</h3>
              <p className="text-gray-600">
                Chatea directamente con las niñeras y organiza el mejor horario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Illustration */}
            <div className="relative order-2 md:order-1">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-8 shadow-lg">
                <div className="w-full h-80 bg-white rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <Heart className="w-32 h-32 mx-auto text-pink-500 mb-4" />
                    <p className="text-xl font-bold text-gray-800">Cuidado Profesional</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Ofrecemos muchas funciones que puedes utilizar para que te sientas a gusto.
              </h2>
              <p className="text-gray-700">
                <strong>¿Tienes que ir a estudiar o a trabajar y necesitas a quien dejar al cuidado de tu hijo o hija?</strong>
              </p>
              <p className="text-gray-600">
                En Home Nannies te facilitaremos todo el proceso de búsqueda, ofreciéndote 
                una plataforma sencilla y fácil de usar. Contamos con la disponibilidad de las 
                niñeras accesible, facilitando el contacto para los padres con facilidades en 
                cuanto al pago mediante la modalidad. Imparte, a partir esto también es más fácil 
                para las niñeras lograr clientes desde nuestra aplicación en línea (ya que sirve 
                como medio de transporte).
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Puedes agendar en cualquier momento</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Revisa la información de quién va a cuidar a tu bebe/a</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Escoge a tu favorita que mejor son tus necesidades</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Toma contacto directo con la interesada al cuidado y para saber como va todo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-pink-500 to-pink-600 py-12 px-6 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Award className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold">500+</p>
              <p className="text-pink-100">Niñeras Verificadas</p>
            </div>
            <div>
              <Users className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold">1,000+</p>
              <p className="text-pink-100">Familias Felices</p>
            </div>
            <div>
              <Clock className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-pink-100">Disponibilidad</p>
            </div>
            <div>
              <Heart className="w-12 h-12 mx-auto mb-3" />
              <p className="text-3xl font-bold">4.9★</p>
              <p className="text-pink-100">Calificación Promedio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Listo para encontrar a tu niñera ideal?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Únete a miles de familias que ya confían en Home Nannies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-pink-500 text-white text-lg font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-md"
            >
              Registrarse Ahora
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="px-8 py-3 bg-white text-pink-600 text-lg font-semibold rounded-lg border-2 border-pink-500 hover:bg-pink-50 transition-colors"
            >
              Ver Catálogo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
