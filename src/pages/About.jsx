// src/pages/About.jsx (or wherever your file is located)

import React from "react";
import Footer from "../components/Footer";
import Header from "../components/UserHeader";

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header />
      <div className="bg-gray-50 dark:bg-gray-800">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 py-16 px-6 md:px-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 dark:text-blue-300 leading-tight">
              Ku Soo Dhawoow{" "}
              <span className="text-gray-900 dark:text-white">FAARUUQ Bookshop</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              FAARUUQ BookShop waa goob ganacsi oo casri ah oo looga bartay buugaag tayo leh,
              oo maankaada kor u qaadaya,adeeg waxbarasho oo dhameestiran iyo qalabkii waxbarashada 
              iyo akhriska oo dhameestiran kusoo dhawoow.
            
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
              alt="Books"
              className="rounded-2xl shadow-lg w-full max-w-md object-cover"
            />
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-blue-50 dark:bg-blue-900/20 py-16 px-6 md:px-20 text-center">
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300">Himiladeena</h2>
          <p className="mt-6 max-w-3xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed">
           Faaruuq Bookstore waxay u taagan tahay kor u qaadista garaadka iyo aqoonta bulshada, iyada 
           oo loo marayo fidinta buugaag tayo leh, qalabka waxbarasho, iyo adeegyo casri ah oo fududeynaya 
           helitaanka aqoonta.
          </p>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-blue-50 dark:bg-blue-900/20 py-16 px-6 md:px-20 text-center">
          <h2 className="text-3xl font-bold text-blue-800 dark:text-blue-200">Maxaad noo dooranaysaa?</h2>
          <div className="mt-10 grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-center">
              <img
                src="https://img.icons8.com/color/96/delivery.png"
                alt="Delivery"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Gaarsiin Degdeg ah</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-center">
                Buugaagta aad jeceshahay waxaan kuugu keeneynaa si dhaqso leh oo lagu kalsoonaan karo.
                dalka iyo dibadiisa ba 
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-center">
              <img
                src="https://img.icons8.com/color/96/star.png"
                alt="Top Rated"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Buugaag la Qiimeeyay</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-center">
                Ka hel  buugaag tayo sare leh oo si taxaddar leh loo soo xulay.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 hover:shadow-xl transition flex flex-col items-center">
              <img
                src="https://img.icons8.com/color/96/gift.png"
                alt="Offers"
                className="w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">Dalabyo Gaara</h3>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-center">
                Ku raaxayso qiimo dhimis iyo dalabyo gaar ah oo aad ku heli karto qiimo macquul ah.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;