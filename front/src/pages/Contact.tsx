import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, FileText, Users, BarChart3, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Retour */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour à la carte
        </Link>

        {/* Titre principal */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Découvrez le Diagnostic 360° complet
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vous êtes élu·e ou agent territorial et souhaitez approfondir l'analyse de la résilience de votre territoire ?
          </p>
        </div>

        {/* Explication du pré-diagnostic */}
        <Card className="mb-8 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              Ce que vous voyez actuellement : un pré-diagnostic
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Le score de résilience actuellement affiché sur notre plateforme est un <strong>pré-diagnostic partiel</strong>, 
              calculé exclusivement à partir de <strong>données publiques ouvertes</strong> disponibles en ligne 
              (INSEE, Observatoire des Territoires, data.gouv.fr, etc.).
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Cette version préliminaire permet d'obtenir une première photographie de la vulnérabilité et de la résilience 
              de votre territoire, mais elle ne reflète qu'une partie de la réalité.
            </p>
          </CardContent>
        </Card>

        {/* Ce qu'apporte le diagnostic complet */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Le Diagnostic 360° complet : une analyse approfondie
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              L'établissement d'un <strong>Diagnostic 360° complet</strong> requiert le renseignement par la collectivité 
              d'indicateurs internes qui ne sont pas disponibles publiquement :
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Données de planification</strong> : PCAET, PLUi, SCoT, plans de gestion de crise...</span>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Données de gouvernance</strong> : niveau de coopération intercommunale, dispositifs de participation citoyenne...</span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong>Données opérationnelles</strong> : stocks stratégiques, capacités d'accueil d'urgence, réseaux d'entraide...</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Ces informations permettent d'affiner considérablement l'évaluation et de produire des 
              recommandations opérationnelles adaptées à votre contexte territorial.
            </p>
          </CardContent>
        </Card>

        {/* Résultat réservé */}
        <div className="bg-secondary/30 rounded-xl p-6 mb-10 text-center">
          <p className="text-sm text-muted-foreground italic">
            Le résultat du Diagnostic 360° complet est <strong>strictement réservé aux collectivités locales</strong> 
            et n'est pas diffusé publiquement.
          </p>
        </div>

        {/* Call-to-action */}
        <div className="text-center space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Vous souhaitez en savoir plus ?
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Contactez-nous pour être mis en relation avec notre équipe et découvrir comment établir 
            le Diagnostic 360° complet de votre territoire.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a href="mailto:contact@diag360.org">
              <Mail className="w-5 h-5" />
              Nous contacter
            </a>
          </Button>
          <p className="text-xs text-muted-foreground">
            contact@diag360.org
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Diagnostic 360° · Résilience Territoriale</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
