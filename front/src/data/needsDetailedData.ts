import { 
  Droplet, 
  Utensils, 
  Home, 
  HeartPulse, 
  Shield, 
  BookOpen, 
  Users, 
  TreePine, 
  Factory, 
  Zap, 
  Car 
} from "lucide-react";
import { NeedDetailData } from "@/components/NeedDetailDialog";

export const needsDetailedData: NeedDetailData[] = [
  {
    key: "score_water",
    name: "Avoir accès à l'eau douce",
    icon: Droplet,
    categoryType: "Vital",
    description: "Garantir l'accès à une eau de qualité pour tous les habitants du territoire, en quantité suffisante et de manière pérenne.",
    detailedDescription: `L'accès à l'eau douce correspond à ses usages de base, en premier lieu les usages domestiques (boisson, préparation et cuisson des aliments, hygiène corporelle, hygiène générale et propreté du domicile ou du lieu de vie), mais aussi à des usages d'activités économiques telles que les activités industrielles, l'agriculture, la production d'électricité et le refroidissement des centrales électriques, etc.

Actuellement, l'eau se révèle être la première ressource naturelle affectée par des conflits d'usage en France, dans un contexte de raréfaction liée au réchauffement climatique. Les enjeux de transformation et de soutenabilité dans nos usages de l'eau sont déterminants pour notre résilience collective. L'accès à l'eau comme droit fondamental est reconnu par la législation. En France, ce droit est reconnu par la loi du 30 décembre 2006 qui affirme que « l'usage de l'eau appartient à tous et chaque personne physique, pour son alimentation et son hygiène, a le droit d'accès à l'eau potable dans des conditions économiquement acceptables par tous ».

La quantité minimale d'eau nécessaire pour couvrir les usages domestiques est définie entre 50 et 100 litres d'eau par personne et par jour.`,
    indicators: {
      transverses: [
        { name: "Couverture effective du territoire par au moins un outil de planification et de gestion de l'eau", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i01" },
        { name: "Existence d'un schéma directeur de l'eau potable de moins de 10 ans", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i02" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i03" },
      ],
      subsistance: {
        description: "Permettre à chacun de répondre à ses besoins en quantité et avec une qualité suffisantes",
        items: [
          { name: "Taux de conformité physico chimique de l'eau distribuée au robinet", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i04" },
          { name: "Taux de conformité microbiologique de l'eau distribuée au robinet", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i05" },
          { name: "Existence d'un diagnostic territorial sur les conditions d'accès à l'eau de consommation humaine", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i06" },
          { name: "Mise en œuvre de mesures permettant de garantir l'accès à l'eau de consommation humaine", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i07" },
          { name: "Existence de dispositifs de protection sociale des abonnés pour l'accès à l'eau", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i08" },
        ]
      },
      gestionCrise: {
        description: "Anticiper les risques sur la ressource et développer des réponses (sobriété, efficacité, substitution)",
        items: [
          { name: "Part du territoire en alerte sécheresse estivale pour les eaux superficielles", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i09" },
          { name: "Existence et mise en œuvre d'un PGSSE", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i10" },
          { name: "Fréquence des interruptions de service d'eau potable non programmées", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i11" },
          { name: "Durée d'autonomie du service d'eau potable", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i12" },
          { name: "Existence de ressources alternatives (interconnexion, stocks stratégiques d'eau...)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i13" },
        ]
      },
      soutenabilite: {
        description: "Optimiser les usages de la ressource et préserver sa qualité",
        items: [
          { name: "Indice Linéaire des Volumes non comptés (ILVNC)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i14" },
          { name: "Existence d'une tarification progressive de l'eau", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i15" },
          { name: "Prélèvements d'eau à usage domestique par habitant et par an", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i16" },
          { name: "Conformité des performances des équipements d'épuration", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv1_i17" },
        ]
      }
    }
  },
  {
    key: "score_food",
    name: "Se nourrir",
    icon: Utensils,
    categoryType: "Vital",
    description: "Assurer l'approvisionnement alimentaire du territoire en privilégiant les circuits courts et une production locale diversifiée.",
    detailedDescription: `Manger à sa faim constitue un 2ème besoin élémentaire. Ce besoin recouvre néanmoins une grande diversité de facettes et d'enjeux, allant de la sécurité et la souveraineté alimentaire jusqu'à l'adaptation de l'agriculture au changement climatique en passant par la préservation des ressources, la santé humaine ou encore le développement économique territorial.

Le modèle productif agro-alimentaire, du champ à l'assiette, a permis de répondre en grande partie au problème de la faim en France depuis la fin de la 2e Guerre mondiale, en même temps qu'il a dégradé massivement les écosystèmes naturels et affecté la santé humaine. Près d'un Français sur deux est en surpoids et 17 % de la population adulte est en situation d'obésité, tandis que 16% des Français disent ne pas manger à leur faim et que 5 à 7 millions de citoyens ont recours à l'aide alimentaire.

L'échelon local apparaît particulièrement pertinent pour développer une approche globale de l'alimentation et engager une transition agricole et alimentaire, respectueuse de l'environnement, de la santé et la culture.`,
    indicators: {
      transverses: [
        { name: "Existence d'un Projet Alimentaire Territorial", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun un approvisionnement alimentaire de proximité et sain",
        items: [
          { name: "Evolution de la Surface Agricole Utile entre 2010 et 2020", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i03" },
          { name: "Nombre de marchés de producteurs hebdomadaires pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i04" },
          { name: "Densité de supérettes et d'épiceries pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i05" },
          { name: "Accessibilité théorique aux commerces alimentaires à vélo", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i06" },
          { name: "Part de la restauration collective respectant les critères d'approvisionnement de la loi Egalim", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i07" },
        ]
      },
      gestionCrise: {
        description: "Anticiper les risques de rupture de l'approvisionnement alimentaire et augmenter la souveraineté alimentaire du territoire",
        items: [
          { name: "Evolution des actifs agricoles entre 2008 et 2019", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i08" },
          { name: "Adéquation théorique entre la production agricole et la consommation du territoire", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i10" },
        ]
      },
      soutenabilite: {
        description: "Minimiser l'empreinte écologique de l'alimentation et préserver les écosystèmes nourriciers",
        items: [
          { name: "Part de la surface agricole en agriculture biologique sur la surface agricole utile", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i11" },
          { name: "Part de la Surface Agricole Utile sur la superficie totale du territoire", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i12" },
          { name: "Quantité annuelle d'achats de substances actives rapporté à la SAU du territoire", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i13" },
          { name: "Score « Haute Valeur Naturelle »", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv2_i14" },
        ]
      }
    }
  },
  {
    key: "score_housing",
    name: "Avoir un toit",
    icon: Home,
    categoryType: "Vital",
    description: "Proposer des logements adaptés, accessibles et résilients face aux aléas climatiques pour l'ensemble de la population.",
    detailedDescription: `Le droit au logement est un droit économique et social à bénéficier d'un logement convenable ou d'un abri. 14,6 millions de Français sont aujourd'hui fragilisés par la crise du logement.

Le mal-logement recouvre de multiples réalités : sans-abrisme ou absence de domicile personnel, difficultés d'accès au logement, mauvaises conditions d'habitat… Disposer d'un toit recouvre ainsi la faculté à accéder à un hébergement provisoire ou d'urgence, mais aussi à un logement décent et pérenne.

Les collectivités ont les clés du logement accessible, digne et durable sur leurs territoires. Leur action doit permettre de proposer des logements décents à tous, de réguler les marchés immobiliers, de renforcer les solidarités et de lutter contre la ségrégation spatiale.

Le changement climatique accroît les risques pour l'habitabilité des territoires (retrait-gonflement des argiles, sécheresses, inondations, tempêtes…), qui doivent être pris en compte dans les démarches de planification et d'adaptation territoriale.`,
    indicators: {
      transverses: [
        { name: "Existence d'un Plan Local de l'Habitat (PLH)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun de vivre dans un logement digne",
        items: [
          { name: "Nombre de personnes sans domicile fixe pour 100 000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i03" },
          { name: "Part des logements en situation de sur-occupation", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i04" },
          { name: "Taux de précarité énergétique liée au logement", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i05" },
          { name: "Taux de résidences secondaires", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i06" },
          { name: "Part des logements sociaux dans l'ensemble des logements", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i07" },
          { name: "Taux de logements vacants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i08" },
        ]
      },
      gestionCrise: {
        description: "Anticiper les risques sur le bâti et disposer de solutions d'hébergement en cas de crise",
        items: [
          { name: "Existence d'un document identifiant les zones de logement exposées aux risques climatiques", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i09" },
          { name: "Capacité d'accueil des abris d'urgence pour 100 000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i10" },
        ]
      },
      soutenabilite: {
        description: "Minimiser l'empreinte environnementale de l'habitat",
        items: [
          { name: "Part des logements « passoires énergétiques » dans le parc de logements", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i11" },
          { name: "Part de résidences principales chauffées au gaz ou au fioul", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i12" },
          { name: "Mise en œuvre effective d'un service public local de la rénovation énergétique", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv3_i13" },
        ]
      }
    }
  },
  {
    key: "score_healthcare",
    name: "Être en capacité de se soigner",
    icon: HeartPulse,
    categoryType: "Vital",
    description: "Maintenir une offre de soins de proximité et d'urgence accessible à tous les habitants du territoire.",
    detailedDescription: `La santé des individus fait partie de droits humains fondamentaux, reconnu par la Constitution de l'OMS : toute personne a le droit de jouir du meilleur état de santé physique et mentale possible. Ces droits incluent l'accès à des services de santé de qualité sans discrimination.

La France a inscrit la protection de la santé parmi les valeurs constitutionnelles en 1946 et a créé de nombreux dispositifs pour la garantir. Les évolutions de la société et les difficultés de notre système de santé conduisent les collectivités territoriales à l'intéresser de plus en plus activement aux enjeux de santé, à travers leurs compétences sociales et médico-sociales, et au-delà via leur action en matière d'urbanisme, d'éducation, de loisirs et de culture, etc.

Ce travail partage des points de vue avec le concept de santé commune, qui considère que la santé des humains dépend de la santé des sociétés, qui elle-même dépend de la santé des milieux naturels.`,
    indicators: {
      transverses: [
        { name: "Existence d'un Contrat Local de Santé", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun de se soigner",
        items: [
          { name: "Accessibilité potentielle localisée (APL) aux médecins généralistes de 65 ans et moins", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i03" },
          { name: "Part de la population éloignée des soins de proximité", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i04" },
          { name: "Densité d'officine de Pharmacie", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i05" },
          { name: "Accessibilité potentielle localisée (APL) aux infirmiers de 65 ans et moins", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i06" },
          { name: "Accessibilité potentielle (APL) aux sage-femmes de 65 ans et moins", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i07" },
          { name: "Accessibilité potentielle (APL) aux Chirurgiens-Dentistes de 65 ans et moins", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i08" },
          { name: "Accessibilité potentielle (APL) aux Masseurs-Kinésithérapeutes de 65 ans et moins", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i09" },
          { name: "Taux d'équipement en Médecine-Chirurgie-Obstétrique (nombre de lits)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i10" },
        ]
      },
      gestionCrise: {
        description: "Assurer la continuité des services de santé en situation de crise",
        items: [
          { name: "Présence d'une structure de santé de type SU ou SMUR", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv4_i11" },
        ]
      }
    }
  },
  {
    key: "score_security",
    name: "Se sentir en sécurité",
    icon: Shield,
    categoryType: "Vital",
    description: "Protéger les populations face aux risques naturels, technologiques et sociaux par des dispositifs de prévention et de gestion de crise.",
    detailedDescription: `La sécurité physique et psychique est un des besoins fondamentaux qui, lorsque non satisfait, ne permet pas de se projeter et de s'engager dans des projets pour l'avenir.

La compréhension des aléas (climatiques, socio-économiques, politiques, etc.) qui menacent le territoire permet d'identifier ses vulnérabilités et dépendances, et de développer des réponses adaptées afin d'augmenter sa résilience, et donc sa sécurité.

Au cours des derniers siècles, nous avons travaillé à réduire le niveau d'incertitude, jusqu'à tendre vers une société du risque zéro. Les crises écologiques viennent bousculer cette quête de sécurité. Les collectivités locales doivent désormais se préparer à assurer la sécurité de leurs habitants dans un contexte de plus en plus incertain et chamboulé.

Cette fonction-clé représente aussi la capacité de la collectivité à assurer la sécurité de ses citoyens, « en temps de paix comme en temps de guerre ».`,
    indicators: {
      transverses: [
        { name: "Part des communes couvertes par un PCS ou un PICS", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i01" },
        { name: "Identification d'un agent-référent au sein de l'intercommunalité", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i02" },
      ],
      subsistance: {
        description: "Veiller à la sécurité de chacun au quotidien",
        items: [
          { name: "Nombre de victimes de violences de type « coups et blessures » pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i03" },
        ]
      },
      gestionCrise: {
        description: "Anticiper les risques pour la sécurité des personnes et organiser la gestion de crise",
        items: [
          { name: "Nombre de risques majeurs auxquels sont exposées les communes du territoire", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i04" },
          { name: "Recensement effectif des sites ou événements sensibles", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i05" },
          { name: "Existence de relations de travail entre la collectivité et les associations agréées de sécurité civile", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i06" },
          { name: "Existence d'un schéma de résilience numérique", url: "https://konsilion.github.io/diag360/pages/indicateurs/bv5_i07" },
        ]
      }
    }
  },
  {
    key: "score_education",
    name: "S'informer et s'instruire",
    icon: BookOpen,
    categoryType: "Essentiel",
    description: "Permettre l'accès à l'éducation, à l'information et aux savoirs pour tous, tout au long de la vie.",
    detailedDescription: `L'accès à l'instruction et à l'information est à la fois un droit fondamental (reconnu par la Déclaration Universelle des Droits de l'Homme) et un besoin essentiel pour les individus et pour la société. Ces deux éléments sont indispensables au développement personnel, à l'exercice de la citoyenneté, et au vivre ensemble.

À l'échelle individuelle, l'éducation est un levier de justice sociale : elle permet à chacun, indépendamment de son origine, de se construire un avenir. Elle favorise l'ascension sociale et la réduction des inégalités économiques et culturelles.

À l'échelle collective, l'instruction nourrit la recherche, la science et l'innovation, qui sont essentielles au développement des sociétés et permet d'affronter les défis globaux (dont les crises systémiques de l'anthropocène). L'information permet aussi le dialogue entre les individus et les communautés.`,
    indicators: {
      transverses: [
        { name: "Existence d'un Projet Éducatif Territorial (PEDT)", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun un accès aux savoirs (éducatifs, culturels, informationnels)",
        items: [
          { name: "Indice de fragilité numérique", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i03" },
          { name: "Nombre de médias locaux indépendants à l'échelle départementale", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i04" },
          { name: "Distance moyenne aux bibliothèques", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i05" },
        ]
      },
      gestionCrise: {
        description: "Créer une culture commune de la résilience",
        items: [
          { name: "Part des établissements scolaires engagés dans une démarche globale de développement durable (label E3D)", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i06" },
          { name: "Part des établissements scolaires enseignant la préparation aux situations d'urgence et la réduction des risques", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i07" },
          { name: "Part des communes du territoire de plus de 5000 habitants disposant d'une programmation événementielle en lien avec la transition écologique", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i08" },
        ]
      },
      soutenabilite: {
        description: "Minimiser l'empreinte écologique des activités et événements socio-culturels",
        items: [
          { name: "Existence d'un dispositif d'éco-conditionnalité des aides aux acteurs et projets associatifs", url: "https://konsilion.github.io/diag360/pages/indicateurs/be1_i09" },
        ]
      }
    }
  },
  {
    key: "score_social_cohesion",
    name: "Vivre ensemble et faire société",
    icon: Users,
    categoryType: "Essentiel",
    description: "Favoriser la cohésion sociale, l'entraide et la participation citoyenne au sein du territoire.",
    detailedDescription: `La capacité d'un territoire à faire face et absorber un choc, en particulier lorsque ce dernier est soudain, dépend largement de la cohésion et des liens sociaux constitués entre les habitants, les institutions, et tous les autres types d'acteurs.

Ces deux traits de caractère peuvent préexister, grâce à l'histoire du territoire, mais la collectivité a un rôle déterminant à jouer pour faire vivre et nourrir la cohésion sociale, les solidarités, la vie démocratique. Elle doit pour cela faire croître une culture du dialogue, un état d'esprit de confiance mutuelle, une communication transparente, des habitudes de coopération.

Le sentiment d'appartenance à une même communauté de vie, au-delà de la diversité du corps social, concourt aussi cette cohésion sociale. Ainsi mobilisés et soudés, les acteurs du territoire développent leurs capacités de co-responsabilité, d'auto-organisation, d'autonomie et de coopération, et gagnent ainsi en résilience.`,
    indicators: {
      transverses: [
        { name: "Existence d'une Convention Territoriale Globale (CTG) comprenant une analyse des besoins sociaux", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i02" },
        { name: "Reconnaissance de l'engagement de l'Office de Tourisme dans la transition écologique", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i03" },
      ],
      subsistance: {
        description: "Permettre à chacun de participer à la vie sociale, réduire l'isolement et développer le lien social",
        items: [
          { name: "Part des ménages d'une seule personne", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i04" },
          { name: "Taux de pauvreté", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i05" },
          { name: "Part des jeunes (15-24 ans) non insérés", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i06" },
          { name: "Taux de participation aux élections municipales 2020", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i07" },
          { name: "Nombre de lieux de sociabilité publics pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i08" },
          { name: "Taux de couverture accueil jeune enfant pour 100 enfants de moins de 3 ans", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i09" },
          { name: "Nombre d'associations pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i10" },
          { name: "Nombre de structures de l'animation de la vie sociale agréée par la CAF", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i11" },
          { name: "Nombre d'événements grand public festifs et fédérateurs organisés par la collectivité par an", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i12" },
        ]
      },
      gestionCrise: {
        description: "Prévenir les crises sociales par la lutte contre les inégalités et la ségrégation sociales",
        items: [
          { name: "Rapport interdécile du niveau de vie (9e décile / 1er décile)", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i13" },
          { name: "Différence entre le taux d'emploi des femmes et des hommes", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i14" },
          { name: "Nombre de travailleurs sociaux / Nombre d'allocataires du RSA", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i15" },
          { name: "Part des communes de plus de 1000 habitants ayant totalement mis en œuvre leur PAVE", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i16" },
          { name: "Part des femmes dans l'exécutif communautaire", url: "https://konsilion.github.io/diag360/pages/indicateurs/be2_i17" },
        ]
      }
    }
  },
  {
    key: "score_nature",
    name: "Être en lien avec la nature",
    icon: TreePine,
    categoryType: "Essentiel",
    description: "Préserver et développer les espaces naturels, la biodiversité et l'accès à la nature pour tous.",
    detailedDescription: `En France, plus de 80% de la population vit en milieu urbain. Les périodes de confinement récentes ont rappelé combien le temps passé dehors, dans la nature est vital pour notre santé et bien-être.

Ce lien originel entre l'homme et la nature est mis en danger depuis la révolution copernicienne, et de façon plus critique depuis la révolution numérique en cours. Il est pourtant garant du bien-être à plusieurs niveaux, tant sur le plan physique que psychique, social et spirituel.

Dans la mesure où la nature favorise la bonne santé, les émotions positives, les liens sociaux, l'inspiration créative et la spiritualité, il est évident qu'elle contribue à la résilience. Les collectivités ont donc tout intérêt à renforcer les interactions entre leurs habitants et leur écosystème naturel, dans une perspective de résilience territoriale.`,
    indicators: {
      transverses: [
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i01" },
      ],
      subsistance: {
        description: "Permettre à chacun de profiter d'un environnement naturel sain et préservé à proximité de son lieu de vie",
        items: [
          { name: "Part des forêts et milieux semi-naturels sur la surface totale du territoire", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i02" },
          { name: "Nombre d'établissements dépassant les seuils de déclaration d'émission de polluants atmosphériques", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i03" },
          { name: "Part du territoire en zone protégée", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i04" },
          { name: "Superficie moyenne d'espaces verts par habitant dans la ville-centre", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i05" },
          { name: "Nombre de jours d'épisode de pollution de l'air par an", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i06" },
        ]
      },
      soutenabilite: {
        description: "Préserver les espaces naturels et la biodiversité du territoire de l'anthropisation",
        items: [
          { name: "Existence d'un coefficient de biotope dans le plan local d'urbanisme", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i07" },
          { name: "Part de la surface du territoire consommée entre 2009 et 2021", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i08" },
          { name: "Part des communes couvertes par un Atlas de la Biodiversité Communale (ABC)", url: "https://konsilion.github.io/diag360/pages/indicateurs/be3_i09" },
        ]
      }
    }
  },
  {
    key: "score_local_economy",
    name: "Produire et s'approvisionner localement",
    icon: Factory,
    categoryType: "Induit",
    description: "Développer une économie locale résiliente, circulaire et créatrice d'emplois durables.",
    detailedDescription: `Les grandes tendances macro-économiques montrent la forte probabilité de récessions partielles ou globales dans les décennies à venir, notamment liées à la raréfaction des ressources naturelles, dont les énergies fossiles sur lesquelles repose notre système économique.

L'épuisement des écosystèmes et des ressources ont des effets importants sur la stabilité socio-économique et géopolitique de notre système globalisé, et révèle son caractère profondément linéaire, fondé sur le principe « extraction-transformation-rejet ».

La prise en compte des limites planétaires implique de concevoir et mettre en place un nouveau système économique, plus sobre et circulaire, réduisant la consommation de ressources, d'énergies, de matières et la production de déchets, compatible avec l'idée d'un monde aux ressources finies.`,
    indicators: {
      transverses: [
        { name: "Existence d'un document-cadre en matière d'économie circulaire", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun de répondre à ses besoins en biens et services sur son territoire et de contribuer à l'économie locale",
        items: [
          { name: "Nombre d'équipements total pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i03" },
          { name: "Taux d'actifs et d'emplois", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i04" },
          { name: "Part des emplois de la sphère présentielle", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i05" },
        ]
      },
      gestionCrise: {
        description: "Anticiper, prévenir et gérer les impacts des crises économiques sur le territoire et développer une économie endogène",
        items: [
          { name: "Part des emplois jugés « à risque »", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i06" },
          { name: "Indicateur de dépendance économique", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i07" },
          { name: "Part des emplois dans l'économie sociale et solidaire dans l'ensemble de l'économie", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i08" },
        ]
      },
      soutenabilite: {
        description: "Minimiser l'empreinte écologique des activités économiques",
        items: [
          { name: "Existence d'un dispositif de tarification incitative sur la collecte des déchets", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i09" },
          { name: "Taux de valorisation matière et organique des déchets ménagers et assimilés", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i10" },
          { name: "Part des achats publics intégrant au moins une considération environnementale", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi1_i11" },
        ]
      }
    }
  },
  {
    key: "score_energy",
    name: "Avoir accès à l'énergie",
    icon: Zap,
    categoryType: "Induit",
    description: "Assurer un approvisionnement énergétique sobre, renouvelable et accessible à tous.",
    detailedDescription: `L'énergie est un produit de première nécessité qui permet de répondre à un ensemble varié de besoins, il est indispensable pour permettre de se chauffer, se mouvoir, se vêtir, s'équiper, s'alimenter, se soigner, se divertir…

L'accès à une énergie fiable et bon marché a été le fondement des révolutions industrielles et de la Grande Accélération de la 2nd moitié du 20è siècle, et constitue une clé de lecture majeure de la géopolitique internationale.

En France, l'accès à l'énergie est un droit garanti par la loi n°2000-108 du 10 février 2000, qui dispose que tous les citoyens français ont le droit d'accéder à l'énergie pour leur assurer un niveau de vie décent tout en agissant pour la protection de l'environnement.

La combustion d'énergie fossile étant la principale cause d'émission de gaz à effet de serre, la lutte contre le réchauffement climatique impose une transition énergétique.`,
    indicators: {
      transverses: [
        { name: "Existence d'un schéma directeur des énergies (SDE)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun de répondre à ses besoins d'énergie",
        items: [
          { name: "Consommation énergétique par habitant, hors secteur économique", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i03" },
        ]
      },
      gestionCrise: {
        description: "Anticiper les risques sur l'approvisionnement énergétique et développer des réponses",
        items: [
          { name: "Taux d'enfouissement des réseaux électriques", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i04" },
          { name: "Nombre de postes-sources alimentant le territoire en électricité", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i05" },
        ]
      },
      soutenabilite: {
        description: "Minimiser l'empreinte écologique de la consommation énergétique territoriale",
        items: [
          { name: "Émissions de gaz à effet de serre énergétiques territoriales par habitant", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i06" },
          { name: "Taux de couverture des besoins énergétiques par les productions renouvelables locales", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i07" },
          { name: "Niveau d'ambition de la trajectoire de réduction des consommations d'énergie par habitant", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi2_i08" },
        ]
      }
    }
  },
  {
    key: "score_mobility",
    name: "Être en capacité de se déplacer",
    icon: Car,
    categoryType: "Induit",
    description: "Proposer des solutions de mobilité durables et accessibles pour tous les habitants du territoire.",
    detailedDescription: `On ne se déplace pas par besoin de se déplacer, mais pour répondre à des besoins divers liés à notre alimentation, nos activités professionnelles et personnelles, etc.

À toute époque, l'homme a considéré comme un acquis technique et social la capacité de se déplacer dans un rayon et à une vitesse permises par les technologies disponibles, du cheval jusqu'à l'avion.

La décarbonation des moyens de transport est un enjeu important, mais la conversion des véhicules d'un carburant fossile vers l'électricité ou un autre carburant peu carboné ne résout pas les questions d'empreinte grise et de matériaux critiques, tout autant déterminantes dans une perspective de durabilité et de résilience.

Le principal enjeu reste de réduire les besoins de déplacement au quotidien, notamment par le rapprochement des activités et résidences et la revitalisation des territoires ruraux.`,
    indicators: {
      transverses: [
        { name: "Existence d'un document-cadre en matière de mobilité durable (PDM, PDMs, schéma directeur...)", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i01" },
        { name: "Identification d'un agent-référent", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i02" },
      ],
      subsistance: {
        description: "Permettre à chacun d'accéder aux équipements répondant à ses besoins",
        items: [
          { name: "Part de la population éloignée des équipements de services de proximité", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i03" },
          { name: "Taux de précarité énergétique mobilité", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i04" },
          { name: "Part des communes présentant un ou plusieurs services résidentiels principaux", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i05" },
        ]
      },
      gestionCrise: {
        description: "Organiser la gestion des flux en situation de crise",
        items: [
          { name: "Identification des principaux itinéraires de secours et d'évacuation", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i06" },
        ]
      },
      soutenabilite: {
        description: "Réduire les besoins de mobilité et minimiser son empreinte écologique",
        items: [
          { name: "Part des déplacements domicile-travail en voiture", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i07" },
          { name: "Nombre de bornes de recharges de véhicules électriques pour 1000 habitants", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i08" },
          { name: "Nombre de kilomètres d'aménagements cyclables par km2 urbanisé", url: "https://konsilion.github.io/diag360/pages/indicateurs/bi3_i09" },
        ]
      }
    }
  },
];
