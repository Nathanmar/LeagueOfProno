import { Button } from "./ui/button";
import { Trophy, Users, Target, Award, TrendingUp, Shield, ShoppingBag } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateToShop: () => void;
}

export function LandingPage({ onGetStarted, onNavigateToShop }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#E5E4E1] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-[#548CB4]" />
              <span className="text-lg sm:text-xl hidden sm:inline" style={{ fontWeight: 700 }}>League of Prono</span>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-[#548CB4] transition-colors">
                Fonctionnalités
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-[#548CB4] transition-colors">
                Comment ça marche
              </a>
              <button 
                onClick={onNavigateToShop}
                className="text-gray-600 hover:text-[#548CB4] transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Boutique
              </button>
            </div>

            {/* Auth Button */}
            <Button
              onClick={onGetStarted}
              className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white text-sm sm:text-base px-3 sm:px-4"
            >
              <span className="hidden sm:inline">Connexion / Inscription</span>
              <span className="sm:hidden">Connexion</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6">
              League of Prono
            </h1>
            
            <p className="text-gray-600 mb-8 sm:mb-12">
              Créez des groupes privés avec vos amis et prouvez qui est le meilleur 
              pronostiqueur sur les matchs e-sport de League of Legends.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white px-6 sm:px-8 py-4 sm:py-6"
              >
                Commencer gratuitement
              </Button>
              <Button
                variant="outline"
                className="border-2 border-[#548CB4] text-[#548CB4] hover:bg-[#548CB4] hover:text-white px-6 sm:px-8 py-4 sm:py-6"
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#548CB4] rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#C4A15B] rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="mb-4">Pourquoi League of Prono ?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Une plateforme simple et élégante pour partager votre passion de l'e-sport avec vos amis
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#548CB4] bg-opacity-10 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-[#548CB4]" />
            </div>
            <h3 className="mb-3">Groupes Privés</h3>
            <p className="text-gray-600">
              Créez des groupes fermés avec vos amis. Partagez simplement un code d'invitation 
              pour que vos amis vous rejoignent.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#548CB4] bg-opacity-10 flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#548CB4]" />
            </div>
            <h3 className="mb-3">Pronostics Simples</h3>
            <p className="text-gray-600">
              Prédisez le vainqueur et le score exact des matchs. Plus vous êtes précis, 
              plus vous gagnez de points.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#548CB4] bg-opacity-10 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-[#548CB4]" />
            </div>
            <h3 className="mb-3">Classements Live</h3>
            <p className="text-gray-600">
              Suivez en temps réel votre position dans chaque groupe et comparez-vous 
              à vos amis.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#C4A15B] bg-opacity-10 flex items-center justify-center mb-6">
              <Award className="w-6 h-6 text-[#C4A15B]" />
            </div>
            <h3 className="mb-3">Badges & Récompenses</h3>
            <p className="text-gray-600">
              Débloquez des badges en accomplissant des défis : scores parfaits, 
              séries de victoires, et plus encore.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#C4A15B] bg-opacity-10 flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6 text-[#C4A15B]" />
            </div>
            <h3 className="mb-3">Compétitions LEC, LCS, LCK, Worlds</h3>
            <p className="text-gray-600">
              Faites vos pronostics sur tous les grands tournois internationaux 
              de League of Legends.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white border border-[#E5E4E1] p-8 hover:border-[#548CB4] transition-colors">
            <div className="w-12 h-12 bg-[#C4A15B] bg-opacity-10 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-[#C4A15B]" />
            </div>
            <h3 className="mb-3">100% Gratuit</h3>
            <p className="text-gray-600">
              Pas de frais cachés, pas d'abonnement. League of Prono est 
              et restera totalement gratuit.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="bg-white border-y border-[#E5E4E1] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="mb-4">Comment ça marche ?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trois étapes simples pour commencer à pronostiquer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#548CB4] text-white flex items-center justify-center mx-auto mb-6 text-2xl" style={{ fontWeight: 700 }}>
                1
              </div>
              <h3 className="mb-3">Créez ou rejoignez un groupe</h3>
              <p className="text-gray-600">
                Créez votre propre groupe ou rejoignez celui de vos amis avec un simple 
                code d'invitation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#548CB4] text-white flex items-center justify-center mx-auto mb-6 text-2xl" style={{ fontWeight: 700 }}>
                2
              </div>
              <h3 className="mb-3">Faites vos pronostics</h3>
              <p className="text-gray-600">
                Prédisez le vainqueur et le score de chaque match avant qu'il ne commence. 
                Modifiez tant qu'il n'est pas trop tard !
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#548CB4] text-white flex items-center justify-center mx-auto mb-6 text-2xl" style={{ fontWeight: 700 }}>
                3
              </div>
              <h3 className="mb-3">Gagnez des points</h3>
              <p className="text-gray-600">
                Accumulez des points à chaque bon pronostic et grimpez dans le classement 
                de votre groupe !
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="bg-gradient-to-br from-[#548CB4] to-[#4a7ca0] text-white p-16 text-center">
          <h2 className="mb-6 text-white">Prêt à devenir le meilleur pronostiqueur ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez League of Prono dès aujourd'hui et commencez à rivaliser avec vos amis
          </p>
          <Button
            onClick={onGetStarted}
            className="bg-white text-[#548CB4] hover:bg-gray-100 px-8 py-6 text-lg"
          >
            Créer mon compte gratuitement
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E5E4E1] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#548CB4]" />
              <span style={{ fontWeight: 600 }}>League of Prono</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              © 2025 League of Prono. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
