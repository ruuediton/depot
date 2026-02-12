import { lazy } from 'react';

export const PAGE_TITLES: Record<string, string> = {
  'home': 'Início',
  'shop': 'Loja',
  'register': 'Criar Conta',
  'login': 'Acessar Conta',
  'profile': 'Meu Perfil',
  'wallet': 'Carteira',
  'deposit': 'Recarga',
  'retirada': 'Retirada',
  'investimentos-fundo': 'Marketplace',
  'historico-fundos': 'Meus Pedidos',
  'invite-page': 'Convidar Amigos',
  'security-verify': 'Segurança',
  'deposit-usdt-history': 'Histórico USDT',
  'subordinate-list': 'Equipe',
  'tasks': 'Minhas Tarefas',
  'detalhes-pay': 'Detalhes da Transferência',
};

export const DEFAULT_APP_TITLE = 'The Home Depot';

export const PAGES_CONFIG = {
  Home: lazy(() => import('./pages/Home')),
  Shop: lazy(() => import('./pages/ShopPage')),
  Profile: lazy(() => import('./pages/Profile')),
  AddBank: lazy(() => import('./pages/AddBank')),
  Recharge: lazy(() => import('./pages/Recharge')),
  PurchaseHistory: lazy(() => import('./pages/PurchaseHistory')),
  ChangePassword: lazy(() => import('./pages/ChangePassword')),
  Register: lazy(() => import('./pages/Register')),
  Withdraw: lazy(() => import('./pages/Withdraw')),
  Login: lazy(() => import('./pages/Login')),
  SecurityVerify: lazy(() => import('./pages/SecurityVerify')),
  GiftChest: lazy(() => import('./pages/GiftChest')),
  RewardClaim: lazy(() => import('./pages/RewardClaim')),
  DepositUSDT: lazy(() => import('./pages/DepositUSDT')),
  DepositUSDTHistory: lazy(() => import('./pages/DepositUSDTHistory')),
  WalletHistory: lazy(() => import('./pages/WalletHistory')),
  WithdrawalHistory: lazy(() => import('./pages/WithdrawalHistory')),
  SubordinateList: lazy(() => import('./pages/SubordinateList')),
  InvitePage: lazy(() => import('./pages/InvitePage')),
  Tasks: lazy(() => import('./pages/Tasks')),
  DetalhesPay: lazy(() => import('./pages/DetalhesPay')),
};
