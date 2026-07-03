export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined; // Contient la barre du bas (Bottom Tabs)
  NouveauClient: undefined;
  // Nous indiquons que l'écran de mesures va recevoir ces 3 informations
  PriseMesures: { clientName: string; clientPhone: string; selectedModel: string };
};

export type BottomTabParamList = {
  Atelier: undefined;
  Clients: undefined;
  Catalogue: undefined;
  Commandes: undefined;
};