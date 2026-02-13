import { lazy } from 'react';

export const PAGE_TITLES: Record<string, string> = {
  'home': 'Início',
  'shop': 'Loja',
  'register': 'registar',
  'login': 'entrar',
  'profile': 'Perfil',
  'deposit': 'Recarga',
  'retirada': 'Retirada',
  'invite-page': 'Convite',
  'subordinate-list': 'Equipe',
  'tasks': 'Tarefas',
  'detalhes-pay': 'Detalhespayment',
  'records-financeiro': 'Registros Financeiros',
  'about-bp': 'Sobre Nós',
};

export const DEFAULT_APP_TITLE = 'TheDepot';

export const PAGES_CONFIG = {
  Home: lazy(() => import('./pages/Home')),
  Shop: lazy(() => import('./pages/ShopPage')),
  Profile: lazy(() => import('./pages/Profile')),
  Register: lazy(() => import('./pages/Register')),
  Login: lazy(() => import('./pages/Login')),
  InvitePage: lazy(() => import('./pages/InvitePage')),
  Tasks: lazy(() => import('./pages/Tasks')),
};
