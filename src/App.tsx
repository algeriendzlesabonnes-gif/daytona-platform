import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  LogOut, 
  LogIn, 
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Menu,
  X,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { User, UserRole, Project, Ticket, AppState, ProjectCategory, ProjectStatus, TicketStatus, GalleryImage, TicketMessage, ShopItem, SocialLink } from './types';
import { INITIAL_PROJECTS, INITIAL_TICKETS, ACCESS_CODES, ASSETS, DISCORD_LINK, INITIAL_GALLERY, INITIAL_SHOP, INITIAL_SOCIALS } from './constants';
import { logToDiscord } from './services/discordService';

// --- Components ---

const Navbar = ({ user, onLogin, onLogout, onNavigate, activeTab }: { 
  user: User | null; 
  onLogin: () => void; 
  onLogout: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'ACCUEIL', icon: Zap },
    { id: 'projects', label: 'PÔLES', icon: LayoutDashboard },
    { id: 'gallery', label: 'GALERIE', icon: LayoutDashboard },
    { id: 'shop', label: 'BOUTIQUE', icon: Activity },
    { id: 'team', label: 'EQUIPE', icon: Users },
    { id: 'socials', label: 'RÉSEAUX', icon: ExternalLink },
    { id: 'join', label: 'REJOINDRE', icon: ChevronRight },
    { id: 'tickets', label: 'SUPPORT', icon: MessageSquare },
    { id: 'unban', label: 'DEMANDE DE DÉBANNISSEMENT', icon: Shield },
  ];

  if (user && (user.role === 'ADMIN' || user.role === 'OWNER')) {
    navItems.push({ id: 'admin', label: 'DASHBOARD', icon: LayoutDashboard });
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 nav-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src={ASSETS.LOGO} alt="Logo" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
            <span className="text-[10px] font-black italic tracking-tighter text-white/40 uppercase">Support</span>
          </div>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1 rounded-md font-bold text-[9px] transition-all hover:bg-white/5 ${
                  activeTab === item.id ? 'bg-white/10 text-white' : 'text-white/40'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-daytona-red italic uppercase tracking-widest">{user.role}</span>
                  <span className="text-[10px] font-bold">{user.username}</span>
                </div>
                {user.avatar ? (
                  <img src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} className="w-6 h-6 rounded-full border border-white/10" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Users size={10} /></div>
                )}
                <button onClick={onLogout} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={onLogin} className="px-3 py-1 rounded-md font-black text-[9px] bg-white/5 hover:bg-white/10 text-white/60 transition-all border border-white/5">
                Se connecter
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setIsOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md font-bold italic text-left hover:bg-white/5"
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              {!user && (
                <button onClick={() => { onLogin(); setIsOpen(false); }} className="w-full btn-primary mt-4">
                  CONNEXION
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AuthModal = ({ isOpen, onClose, onAuth }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAuth: (user: User) => void;
}) => {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleDiscordLogin = async () => {
    try {
      const response = await fetch('/api/auth/discord/url');
      const { url } = await response.json();
      window.open(url, 'discord_auth', 'width=600,height=800');
    } catch (err) {
      setError('Impossible de contacter le serveur d\'authentification');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return setError('Veuillez entrer un identifiant');
    if (!password) return setError('Veuillez entrer un mot de passe');

    // Simulate real account check
    const isRealAccount = username.length > 3 && password.length > 3;
    if (!isRealAccount) {
      return setError('Ce compte n\'existe pas ou n\'est pas lié au Discord');
    }

    let finalRole = selectedRole;
    if (selectedRole !== 'USER') {
      if (selectedRole === 'ADMIN' && code !== ACCESS_CODES.OWNER) {
        return setError('Code d\'accès invalide');
      }
      if (selectedRole === 'STAFF' && code !== ACCESS_CODES.STAFF) {
        return setError('Code d\'accès invalide');
      }
      if (selectedRole === 'GRAPHISTE' && code !== ACCESS_CODES.GRAPHISTE) {
        return setError('Code d\'accès invalide');
      }
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role: finalRole,
      lastLogin: new Date().toISOString()
    };

    onAuth(newUser);
    logToDiscord(`Connexion de ${username} avec le grade ${finalRole}`, 'INFO');
    onClose();
    setStep('select');
    setUsername('');
    setPassword('');
    setCode('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-3xl glass p-8 rounded-2xl border-white/10 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full text-white/40"><X size={20} /></button>

            {step === 'select' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <button 
                  onClick={() => handleSelect('USER')}
                  className="flex flex-col items-center gap-6 p-8 glass rounded-xl hover:border-daytona-red/50 transition-all group"
                >
                  <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center border-4 border-amber-600 overflow-hidden">
                    <Users size={48} className="text-white" />
                  </div>
                  <span className="text-xl font-bold">Accès Utilisateur</span>
                </button>

                <button 
                  onClick={() => handleSelect('ADMIN')}
                  className="flex flex-col items-center gap-6 p-8 glass rounded-xl hover:border-daytona-red/50 transition-all group"
                >
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                      <Shield size={48} className="text-white/60" />
                    </div>
                  </div>
                  <span className="text-xl font-bold">Accès Administratif</span>
                </button>

                <button 
                  onClick={() => handleSelect('GRAPHISTE')}
                  className="flex flex-col items-center gap-6 p-8 glass rounded-xl hover:border-daytona-red/50 transition-all group"
                >
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                     <Activity size={48} className="text-cyan-400" />
                  </div>
                  <span className="text-xl font-bold">Accès Graphiste</span>
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-center mb-10">Connexion</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-daytona-red outline-none transition-colors text-lg"
                      placeholder="Identifiant"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-daytona-red outline-none transition-colors text-lg"
                      placeholder="Mot de passe"
                    />
                  </div>
                  
                  {selectedRole !== 'USER' && (
                    <div>
                      <input
                        type="password"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:border-daytona-red outline-none transition-colors text-lg"
                        placeholder="Code d'accès"
                      />
                    </div>
                  )}

                  <div className="text-center">
                    <button type="button" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
                      Mot de passe oublié ?
                    </button>
                  </div>

                  {error && <p className="text-daytona-red text-xs font-bold italic text-center">{error}</p>}
                  
                  <div className="space-y-3">
                    <button type="submit" className="w-full bg-[#404040] hover:bg-[#505050] text-white font-bold py-4 rounded-xl transition-all text-lg">
                      Se connecter
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={handleDiscordLogin}
                      className="w-full bg-[#3b448a] hover:bg-[#4b549a] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <img src="https://assets-global.website-files.com/6257adef93467e05d00d972d/636e0a2249442231db611740_discord-mark-white.svg" className="w-6 h-6" alt="" />
                      Se connecter avec Discord
                    </button>
                  </div>

                  <button type="button" onClick={() => setStep('select')} className="w-full text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest mt-4">
                    RETOUR AU CHOIX D'ACCÈS
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  key?: React.Key;
}

const ProjectCard = ({ project, isAdmin, onDelete }: ProjectCardProps) => {
  const statusColors = {
    'Disponible': 'bg-emerald-500',
    'Repris': 'bg-daytona-red',
    'Fermé': 'bg-white/20'
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 4 - 2 }}
      animate={{ opacity: 1, scale: 1, rotate: Math.random() * 4 - 2 }}
      className="relative h-[600px] rounded-sm overflow-hidden group border border-white/5 hover:border-daytona-red/30 transition-all duration-700 shadow-2xl bg-white/5 p-2"
    >
      {/* Tape Effect */}
      <div className="tape tape-top opacity-60" />
      
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <img 
          src={project.image || 'https://picsum.photos/seed/default/800/400'} 
          alt={project.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-daytona-black via-daytona-black/40 to-transparent opacity-90" />
        
        <div className="absolute top-6 right-6">
          <span className={`px-4 py-1 rounded-sm text-[10px] font-black italic uppercase tracking-widest ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8">
          <span className="text-xs font-black text-daytona-red uppercase tracking-[0.3em] mb-2 block">{project.category}</span>
          <h3 className="text-4xl font-black italic mb-4 tracking-tighter uppercase">{project.name}</h3>
          <p className="text-sm text-white/80 mb-6 line-clamp-4 font-medium leading-relaxed">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-sm backdrop-blur-sm border border-white/5">
              <Users size={14} className="text-daytona-red" />
              <span className="text-[10px] font-black italic tracking-widest uppercase">{project.leader || 'POSTE À POURVOIR'}</span>
            </div>
            
            {isAdmin && onDelete && (
              <button 
                onClick={() => onDelete(project.id)}
                className="p-2 bg-daytona-red/10 hover:bg-daytona-red/30 rounded-sm text-daytona-red transition-all border border-daytona-red/20"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = ({ state, setState, user }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>>; user: User }) => {
  const [newProject, setNewProject] = useState({ name: '', category: 'Légal' as ProjectCategory, status: 'Disponible' as ProjectStatus, description: '', image: '', leader: '' });
  const [newImage, setNewImage] = useState({ url: '', caption: '' });
  const [newShopItem, setNewShopItem] = useState({ name: '', price: '', image: '', category: 'Véhicule' });
  const [newSocial, setNewSocial] = useState({ name: '', url: '', icon: 'ExternalLink' });
  const [syncing, setSyncing] = useState(false);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const project: Project = {
      ...newProject,
      id: Math.random().toString(36).substr(2, 9),
      image: newProject.image || `https://picsum.photos/seed/${newProject.name}/800/400`
    };
    setState(prev => ({ ...prev, projects: [project, ...prev.projects] }));
    logToDiscord(`Nouveau projet ajouté : ${project.name} par ${user.username}`, 'INFO');
    setNewProject({ name: '', category: 'Légal', status: 'Disponible', description: '', image: '', leader: '' });
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    const image: GalleryImage = {
      id: Math.random().toString(36).substr(2, 9),
      url: newImage.url,
      caption: newImage.caption,
      addedBy: user.username,
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, gallery: [image, ...prev.gallery] }));
    logToDiscord(`Nouvelle photo ajoutée à la galerie par ${user.username}`, 'INFO');
    setNewImage({ url: '', caption: '' });
  };

  const handleAddShopItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ShopItem = {
      ...newShopItem,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({ ...prev, shop: [item, ...prev.shop] }));
    logToDiscord(`Nouvel article boutique ajouté : ${item.name} par ${user.username}`, 'INFO');
    setNewShopItem({ name: '', price: '', image: '', category: 'Véhicule' });
  };

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    const social: SocialLink = {
      ...newSocial,
      id: Math.random().toString(36).substr(2, 9)
    };
    setState(prev => ({ ...prev, socials: [social, ...prev.socials] }));
    logToDiscord(`Nouveau réseau ajouté : ${social.name} par ${user.username}`, 'INFO');
    setNewSocial({ name: '', url: '', icon: 'ExternalLink' });
  };

  const handleGlobalSync = () => {
    setSyncing(true);
    logToDiscord(`Synchronisation globale lancée par ${user.username}`, 'WARN');
    setTimeout(() => {
      setSyncing(false);
      alert('Synchronisation globale terminée avec succès !');
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-daytona-red">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/50 uppercase">Photos Galerie</span>
            <Activity className="text-daytona-red" size={20} />
          </div>
          <span className="text-4xl font-black italic">{state.gallery.length}</span>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/50 uppercase">Pôles Actifs</span>
            <Activity className="text-emerald-500" size={20} />
          </div>
          <span className="text-4xl font-black italic">{state.projects.length}</span>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/50 uppercase">Tickets Support</span>
            <MessageSquare className="text-blue-500" size={20} />
          </div>
          <span className="text-4xl font-black italic">{state.tickets.length}</span>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white/50 uppercase">Boutique</span>
            <Activity className="text-yellow-500" size={20} />
          </div>
          <span className="text-4xl font-black italic">{state.shop.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pôles */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
            <Plus className="text-daytona-red" /> CRÉER UN PÔLE
          </h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Catégorie</label>
                <select 
                  className="w-full bg-daytona-black border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newProject.category}
                  onChange={e => setNewProject({...newProject, category: e.target.value as ProjectCategory})}
                >
                  <option value="Légal">Légal</option>
                  <option value="Illégal">Illégal</option>
                  <option value="Entreprise">Entreprise</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">URL Image</label>
                <input 
                  type="url" 
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newProject.image}
                  onChange={e => setNewProject({...newProject, image: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Leader</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newProject.leader}
                  onChange={e => setNewProject({...newProject, leader: e.target.value})}
                  placeholder="Ex: John Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Description</label>
              <textarea 
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none h-24"
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3">AJOUTER LE PROJET</button>
          </form>
        </div>

        {/* Galerie */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
            <Plus className="text-daytona-red" /> AJOUTER UNE PHOTO
          </h3>
          <form onSubmit={handleAddImage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase">URL de l'image</label>
              <input 
                type="url" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                value={newImage.url}
                onChange={e => setNewImage({...newImage, url: e.target.value})}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Légende</label>
              <input 
                type="text" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                value={newImage.caption}
                onChange={e => setNewImage({...newImage, caption: e.target.value})}
                placeholder="Ex: Patrouille LAPD"
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3">PUBLIER DANS LA GALERIE</button>
          </form>
        </div>

        {/* Boutique */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
            <Activity className="text-daytona-red" /> AJOUTER À LA BOUTIQUE
          </h3>
          <form onSubmit={handleAddShopItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Nom</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newShopItem.name}
                  onChange={e => setNewShopItem({...newShopItem, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Prix</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newShopItem.price}
                  onChange={e => setNewShopItem({...newShopItem, price: e.target.value})}
                  placeholder="Ex: 15.00€"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">URL Image</label>
                <input 
                  type="url" 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newShopItem.image}
                  onChange={e => setNewShopItem({...newShopItem, image: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Catégorie</label>
                <select 
                  className="w-full bg-daytona-black border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                  value={newShopItem.category}
                  onChange={e => setNewShopItem({...newShopItem, category: e.target.value})}
                >
                  <option value="Véhicule">Véhicule</option>
                  <option value="Grade">Grade</option>
                  <option value="Argent">Argent</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full btn-primary py-3">AJOUTER À LA BOUTIQUE</button>
          </form>
        </div>

        {/* Réseaux */}
        <div className="glass p-8 rounded-2xl">
          <h3 className="text-xl font-black italic mb-6 flex items-center gap-2">
            <ExternalLink className="text-daytona-red" /> AJOUTER UN RÉSEAU
          </h3>
          <form onSubmit={handleAddSocial} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase">Nom</label>
              <input 
                type="text" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                value={newSocial.name}
                onChange={e => setNewSocial({...newSocial, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-white/40 mb-1 uppercase">URL</label>
              <input 
                type="url" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 focus:border-daytona-red outline-none"
                value={newSocial.url}
                onChange={e => setNewSocial({...newSocial, url: e.target.value})}
              />
            </div>
            <button type="submit" className="w-full btn-primary py-3">AJOUTER LE RÉSEAU</button>
          </form>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl flex flex-col justify-center items-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${syncing ? 'animate-spin bg-daytona-red/20' : 'bg-daytona-red/10'}`}>
          <Zap className={syncing ? 'text-daytona-red' : 'text-white/20'} size={40} />
        </div>
        <h3 className="text-2xl font-black italic mb-2">SYNCHRONISATION GLOBALE</h3>
        <p className="text-sm text-white/50 mb-8 max-w-xs">
          Met à jour instantanément tous les systèmes, les caches et les webhooks sur l'ensemble de la plateforme.
        </p>
        <button 
          onClick={handleGlobalSync}
          disabled={syncing}
          className={`btn-primary px-12 py-4 text-lg flex items-center gap-3 ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {syncing ? 'SYNCHRONISATION...' : 'LANCER LA SYNC'}
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('daytona_state');
    const initialState: AppState = {
      user: null,
      projects: INITIAL_PROJECTS,
      tickets: INITIAL_TICKETS,
      gallery: INITIAL_GALLERY,
      shop: INITIAL_SHOP,
      socials: INITIAL_SOCIALS
    };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      } catch (e) {
        console.error("Failed to parse saved state", e);
        return initialState;
      }
    }
    return initialState;
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [roleCheckValue, setRoleCheckValue] = useState('');
  const [ticketStep, setTicketStep] = useState<'subject' | 'message'>('subject');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('daytona_state', JSON.stringify(state));
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const discordUser = event.data.user;
        const newUser: User = {
          id: discordUser.id,
          username: discordUser.username,
          avatar: discordUser.avatar,
          role: 'USER',
          lastLogin: new Date().toISOString()
        };
        setState(prev => ({ ...prev, user: newUser }));
        localStorage.setItem('daytona_auth', JSON.stringify(newUser));
        logToDiscord(`Connexion Discord de ${newUser.username}`, 'INFO');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
    setActiveTab('home');
  };

  const handleDeleteProject = (id: string) => {
    setState(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value;

    const newTicket: Ticket = {
      id: `T-${Math.floor(Math.random() * 1000)}`,
      author: state.user?.username || 'Anonyme',
      subject: selectedSubject,
      content,
      status: 'Ouvert',
      createdAt: new Date().toISOString(),
      messages: []
    };

    setState(prev => ({ ...prev, tickets: [newTicket, ...prev.tickets] }));
    logToDiscord(`Nouveau ticket créé : ${selectedSubject} par ${newTicket.author}`, 'INFO');
    form.reset();
    setTicketStep('subject');
    setSelectedSubject('');
    alert('Ticket envoyé avec succès !');
  };

  const handleClaimTicket = (ticketId: string) => {
    if (!state.user) return;
    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => 
        t.id === ticketId ? { ...t, claimedBy: state.user?.username, status: 'En cours' } : t
      )
    }));
    logToDiscord(`Ticket ${ticketId} pris en charge par ${state.user.username}`, 'INFO');
  };

  const handleSendMessage = (ticketId: string) => {
    if (!chatMessage.trim() || !state.user) return;
    
    const newMessage: TicketMessage = {
      id: Math.random().toString(36).substr(2, 9),
      author: state.user.username,
      content: chatMessage,
      createdAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      tickets: prev.tickets.map(t => 
        t.id === ticketId ? { ...t, messages: [...t.messages, newMessage] } : t
      )
    }));
    setChatMessage('');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <div className="scanline" />
      
      <Navbar 
        user={state.user} 
        onLogin={() => setIsAuthModalOpen(true)} 
        onLogout={handleLogout}
        onNavigate={setActiveTab}
        activeTab={activeTab}
      />

      <main className="pt-20 pb-40">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Hero Section */}
              <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <img src={ASSETS.HERO_BG} className="w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-b from-daytona-black/20 via-daytona-black to-daytona-black" />
                </div>
                
                <div className="relative z-10 text-center px-4 max-w-4xl">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex justify-center mb-8">
                      <img src={ASSETS.LOGO} alt="Logo" className="w-32 h-32 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-emerald-400 mb-12 tracking-tight">
                      Support Daytona RolePlay
                    </h1>
                    
                    {!state.user && (
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full max-w-md mx-auto bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-md transition-all flex items-center justify-center gap-3 text-lg border border-white/5"
                      >
                        <img src="https://assets-global.website-files.com/6257adef93467e05d00d972d/636e0a2249442231db611740_discord-mark-white.svg" className="w-6 h-6" alt="" />
                        Se connecter avec Discord
                      </button>
                    )}

                    {state.user && (
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <button onClick={() => setActiveTab('projects')} className="btn-primary px-10 py-4 text-lg w-full sm:w-auto">
                          VOIR LES PÔLES
                        </button>
                        <button onClick={() => setActiveTab('tickets')} className="btn-secondary px-10 py-4 text-lg w-full sm:w-auto">
                          OUVRIR UN TICKET
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Info Section */}
              <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                  <h2 className="text-4xl font-black italic mb-6">UN SYSTÈME <span className="text-daytona-red">UNIQUE.</span></h2>
                  <p className="text-white/60 mb-12 leading-relaxed text-lg">
                    Daytona n'est pas qu'un simple serveur. C'est un écosystème complet où chaque citoyen peut s'épanouir. Notre plateforme web vous permet de gérer vos projets, de contacter le support et de suivre l'évolution de la ville en temps réel.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {[
                      { title: 'Performance Optimisée', desc: 'Un serveur fluide avec un développement sur mesure.' },
                      { title: 'Support Réactif', desc: 'Une équipe de modération disponible 24/7 pour vous aider.' },
                      { title: 'Économie Réaliste', desc: 'Un système financier équilibré pour une immersion totale.' }
                    ].map((item, i) => (
                      <div key={i} className="glass p-6 rounded-xl border border-white/5">
                        <div className="flex justify-center mb-4"><CheckCircle2 className="text-daytona-red" size={32} /></div>
                        <h4 className="font-bold italic mb-2 uppercase tracking-tighter">{item.title}</h4>
                        <p className="text-xs text-white/40">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black italic tracking-tighter mb-4">BOUTIQUE <span className="text-daytona-red">OFFICIELLE.</span></h2>
                <p className="text-white/50">Soutenez le serveur et obtenez des avantages exclusifs en jeu.</p>
              </div>

              {state.shop?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {state.shop.map((item) => (
                    <div key={item.id} className="glass p-6 rounded-2xl border border-white/5 group hover:border-daytona-red/30 transition-all">
                      <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 bg-daytona-red px-3 py-1 rounded text-xs font-black italic">{item.price}</div>
                      </div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">{item.name}</h4>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.category}</span>
                      </div>
                      <button className="w-full btn-primary mt-4 py-3">ACHETER MAINTENANT</button>
                      {(state.user?.role === 'ADMIN' || state.user?.role === 'OWNER') && (
                        <button 
                          onClick={() => setState(prev => ({ ...prev, shop: prev.shop.filter(i => i.id !== item.id) }))}
                          className="w-full mt-2 text-[10px] font-bold text-daytona-red/40 hover:text-daytona-red uppercase tracking-widest transition-colors"
                        >
                          Supprimer l'article
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 glass rounded-sm border-dashed border-white/10 text-center">
                  <p className="text-2xl font-black italic text-white/20 uppercase tracking-widest">EN ATTENTE D'ARTICLES...</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div
              key="team"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black italic tracking-tighter mb-4">NOTRE <span className="text-daytona-red">EQUIPE.</span></h2>
                <p className="text-white/50 uppercase tracking-widest text-xs font-bold italic">L'élite au service de la communauté — Toujours en cours de recrutement</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {/* Créateurs */}
                <div className="glass p-8 rounded-2xl border-t-4 border-daytona-red">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">@Créateur</h3>
                    <span className="bg-daytona-red/20 text-daytona-red px-3 py-1 rounded-full text-[10px] font-black">3</span>
                  </div>
                  <div className="space-y-4">
                    {['!’’k3rv', 'Chocapic', 'Sesko'].map(name => (
                      <div key={name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-daytona-red/30 transition-all">
                        <div className="w-10 h-10 rounded-full bg-daytona-red/10 flex items-center justify-center font-black text-daytona-red">@</div>
                        <span className="font-bold text-lg">@{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Co-Fondateurs */}
                <div className="glass p-8 rounded-2xl border-t-4 border-amber-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">@Co-Fondateur</h3>
                    <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black">2</span>
                  </div>
                  <div className="space-y-4">
                    {['!"Kx4', '✞ItzYasuke💢💤'].map(name => (
                      <div key={name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-all">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-black text-amber-500">@</div>
                        <span className="font-bold text-lg">@{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gérants */}
                <div className="glass p-8 rounded-2xl border-t-4 border-blue-500">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">@Gérant</h3>
                    <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black">2</span>
                  </div>
                  <div className="space-y-4">
                    {['Trauma', 'K_Anam94🇨🇮'].map(name => (
                      <div key={name} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-blue-500/30 transition-all">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-blue-500">@</div>
                        <span className="font-bold text-lg">@{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Candidature Staff */}
              <div className="max-w-4xl mx-auto">
                <div className="glass p-12 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Shield size={120} className="text-daytona-red" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-daytona-red/10 flex items-center justify-center">
                        <Shield className="text-daytona-red" size={32} />
                      </div>
                      <h3 className="text-4xl font-black italic uppercase tracking-tighter">🛠️ | Candidature Staff</h3>
                    </div>

                    <div className="space-y-6 text-left">
                      <p className="text-lg text-white/80 leading-relaxed">
                        Le rôle Staff représente l'équipe responsable du bon fonctionnement du serveur. Les membres qui possèdent ce rôle ont pour mission de veiller au respect du règlement, d'apporter leur aide aux utilisateurs, de maintenir une ambiance agréable et d'intervenir en cas de problème.
                      </p>
                      <p className="text-lg text-white/80 leading-relaxed">
                        Le Staff est également chargé d'organiser et de superviser certaines activités afin de garantir une expérience positive pour l'ensemble de la communauté.
                      </p>
                      
                      <div className="pt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                              <span className="text-2xl">🌍</span> Rejoindre l'aventure
                            </h4>
                            <p className="text-white/50">Si vous êtes intéressé à veiller au bon fonctionnement du serveur, postulez ici.</p>
                          </div>
                          <a 
                            href="https://docs.google.com/forms/d/e/1FAIpQLSf7e66KyaUcKcHQ1zpEFw0X_QQLe5MBb-beG3S8sxZrjGnNug/viewform?usp=sharing&ouid=102223989221927457489" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-primary px-10 py-5 text-lg flex items-center gap-3 whitespace-nowrap"
                          >
                            POSTULER MAINTENANT <ChevronRight size={20} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'socials' && (
            <motion.div
              key="socials"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black italic tracking-tighter mb-4">NOS <span className="text-daytona-red">RÉSEAUX.</span></h2>
                <p className="text-white/50">Suivez-nous sur toutes nos plateformes pour ne rien rater.</p>
              </div>

              {state.socials?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {state.socials.map((social) => (
                    <a 
                      key={social.id} 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="glass p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-daytona-red/30 transition-all"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-daytona-red/10 transition-colors">
                        <ExternalLink className="text-white/20 group-hover:text-daytona-red transition-colors" size={32} />
                      </div>
                      <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{social.name}</h4>
                      <p className="text-xs text-white/30 uppercase tracking-widest">Suivre sur {social.name}</p>
                      {(state.user?.role === 'ADMIN' || state.user?.role === 'OWNER') && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            setState(prev => ({ ...prev, socials: prev.socials.filter(s => s.id !== social.id) }));
                          }}
                          className="mt-6 text-[10px] font-bold text-daytona-red/40 hover:text-daytona-red uppercase tracking-widest transition-colors"
                        >
                          Supprimer le lien
                        </button>
                      )}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-20 glass rounded-sm border-dashed border-white/10 text-center">
                  <p className="text-2xl font-black italic text-white/20 uppercase tracking-widest">EN ATTENTE DE LIENS...</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12 text-center"
            >
              <h2 className="text-5xl font-black italic tracking-tighter mb-8">NOUS <span className="text-daytona-red">REJOINDRE.</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="glass p-12 rounded-2xl border border-white/5 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-daytona-red/10 flex items-center justify-center mb-8">
                    <img src="https://assets-global.website-files.com/6257adef93467e05d00d972d/636e0a2249442231db611740_discord-mark-white.svg" className="w-10 h-10" alt="" />
                  </div>
                  <h3 className="text-2xl font-black italic mb-4 uppercase tracking-tighter">DISCORD OFFICIEL</h3>
                  <p className="text-sm text-white/50 mb-8">Rejoignez notre communauté sur Discord pour obtenir votre citoyenneté et accéder au serveur.</p>
                  <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary w-full py-4 text-center">REJOINDRE LE DISCORD</a>
                </div>

                <div className="glass p-12 rounded-2xl border border-white/5 flex flex-col items-center opacity-50">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8">
                    <Zap className="text-white/20" size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic mb-4 uppercase tracking-tighter">SESSION ERLC</h3>
                  <p className="text-sm text-white/50 mb-8">Accédez directement à la session de jeu sur Roblox ERLC (Code requis).</p>
                  <button disabled className="bg-white/5 text-white/20 font-black py-4 rounded-md w-full cursor-not-allowed">EN ATTENTE...</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'unban' && (
            <motion.div
              key="unban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12 text-center"
            >
              <h2 className="text-5xl font-black italic tracking-tighter mb-8">DÉBANNISSEMENT <span className="text-daytona-red">HUB.</span></h2>
              <div className="py-20 glass rounded-sm border-dashed border-white/10">
                <p className="text-2xl font-black italic text-white/20 uppercase tracking-widest">EN ATTENTE DE SYSTÈME...</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black italic tracking-tighter mb-4">CITY <span className="text-daytona-red">GALLERY.</span></h2>
                <p className="text-white/50">Les plus beaux clichés de Los Angeles capturés par nos citoyens et notre équipe.</p>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {state.gallery?.length > 0 ? (
                  state.gallery.map((img) => (
                    <motion.div 
                      key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 6 - 3 }}
                      animate={{ opacity: 1, scale: 1, rotate: Math.random() * 6 - 3 }}
                      className="relative group break-inside-avoid rounded-sm overflow-hidden bg-white/5 p-2 border border-white/5 shadow-xl"
                    >
                      <div className="tape tape-corner opacity-40" />
                      <img src={img.url} alt={img.caption} className="w-full h-auto object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-daytona-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h4 className="text-lg font-black italic uppercase tracking-tighter">{img.caption}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] font-black text-daytona-red uppercase tracking-widest">BY {img.addedBy}</span>
                          {(state.user?.role === 'ADMIN' || state.user?.role === 'OWNER' || state.user?.role === 'STAFF') && (
                            <button 
                              onClick={() => setState(prev => ({ ...prev, gallery: prev.gallery.filter(i => i.id !== img.id) }))}
                              className="p-1.5 bg-daytona-red/10 rounded-sm text-daytona-red hover:bg-daytona-red hover:text-white transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center glass rounded-sm border-dashed border-white/10">
                    <p className="text-2xl font-black italic text-white/20 uppercase tracking-widest">EN ATTENTE DE PHOTOS...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-5xl font-black italic tracking-tighter mb-2">PROJECT <span className="text-daytona-red">HUB.</span></h2>
                  <p className="text-white/50">Gestion et affichage des organisations de la ville.</p>
                </div>
                <div className="flex gap-2">
                  {['Tous', 'Légal', 'Illégal', 'Entreprise'].map((cat) => (
                    <button key={cat} className="glass px-4 py-2 rounded-md text-xs font-bold italic hover:bg-white/10 transition-colors">
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {state.projects?.length > 0 ? (
                  state.projects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      isAdmin={state.user?.role === 'ADMIN' || state.user?.role === 'OWNER'} 
                      onDelete={handleDeleteProject}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center glass rounded-sm border-dashed border-white/10">
                    <p className="text-2xl font-black italic text-white/20 uppercase tracking-widest">EN ATTENTE DE PROJETS...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div
              key="tickets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              {viewingTicket ? (
                <div className="glass p-8 rounded-2xl">
                  <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-6">
                    <div>
                      <button onClick={() => setViewingTicket(null)} className="text-daytona-red hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-2">
                        <ChevronRight className="rotate-180" size={16} /> RETOUR AUX TICKETS
                      </button>
                      <h2 className="text-3xl font-black italic">{viewingTicket.subject}</h2>
                      <p className="text-white/40 text-sm">Ticket {viewingTicket.id} • Créé par {viewingTicket.author}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {viewingTicket.claimedBy ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-md border border-emerald-500/20">
                          <Users size={16} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-500 uppercase">PRIS EN CHARGE PAR {viewingTicket.claimedBy}</span>
                        </div>
                      ) : (
                        (state.user?.role === 'ADMIN' || state.user?.role === 'OWNER' || state.user?.role === 'STAFF') && (
                          <button onClick={() => handleClaimTicket(viewingTicket.id)} className="btn-primary px-6 py-2">PRENDRE EN CHARGE</button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-6">
                      <div className="glass p-6 rounded-xl bg-white/5">
                        <p className="text-white/80 leading-relaxed">{viewingTicket.content}</p>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        {viewingTicket.messages.map((msg) => (
                          <div key={msg.id} className={`flex flex-col ${msg.author === state.user?.username ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-xl ${msg.author === state.user?.username ? 'bg-daytona-red/20 border border-daytona-red/30' : 'bg-white/5 border border-white/10'}`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <span className="text-[9px] font-bold text-white/20 mt-1 uppercase">{msg.author} • {new Date(msg.createdAt).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <textarea 
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-3 focus:border-emerald-500 outline-none h-20 resize-none"
                          placeholder="Votre message..."
                        />
                        <button 
                          onClick={() => handleSendMessage(viewingTicket.id)}
                          className="btn-primary px-8 flex items-center justify-center"
                        >
                          ENVOYER
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                      <div className="glass p-6 rounded-xl border border-white/5">
                        <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-4">Détails</h4>
                        <div className="space-y-4">
                          <div>
                            <span className="block text-[10px] text-white/20 uppercase">Statut</span>
                            <span className="text-sm font-bold italic text-emerald-400">{viewingTicket.status}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-white/20 uppercase">Date</span>
                            <span className="text-sm font-bold italic">{new Date(viewingTicket.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1">
                    <div className="glass p-8 rounded-2xl sticky top-24">
                      <h2 className="text-3xl font-black italic mb-6">SUPPORT <span className="text-daytona-red">DAYTONA.</span></h2>
                      
                      {ticketStep === 'subject' ? (
                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-white/60 mb-2 uppercase">Sujet de la demande</label>
                            <select 
                              value={selectedSubject}
                              onChange={(e) => setSelectedSubject(e.target.value)}
                              className="w-full bg-white/5 border border-emerald-500/50 rounded-md px-4 py-3 focus:border-emerald-500 outline-none text-white/80 appearance-none"
                            >
                              <option value="" className="bg-daytona-black">-- Sélectionner un sujet --</option>
                              <option value="Création d'organisation" className="bg-daytona-black">Création d'organisation</option>
                              <option value="Problème technique" className="bg-daytona-black">Problème technique</option>
                              <option value="Remboursement" className="bg-daytona-black">Remboursement</option>
                              <option value="Plainte" className="bg-daytona-black">Plainte</option>
                              <option value="Autre" className="bg-daytona-black">Autre</option>
                            </select>
                          </div>
                          <button 
                            onClick={() => selectedSubject && setTicketStep('message')}
                            disabled={!selectedSubject}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-md transition-all disabled:opacity-50"
                          >
                            Continuer
                          </button>
                          <div className="pt-4 space-y-4 text-center">
                            <button 
                              onClick={() => {
                                setSelectedSubject('');
                                setTicketStep('subject');
                              }} 
                              className="text-[11px] font-bold text-white/40 hover:text-white underline underline-offset-4"
                            >
                              Supprimer les données relatives au formulaire
                            </button>
                            <div className="text-[11px] font-bold text-white/40">
                              Accéder à <button 
                                onClick={() => {
                                  const el = document.getElementById('recent-tickets');
                                  el?.scrollIntoView({ behavior: 'smooth' });
                                }} 
                                className="hover:text-white underline underline-offset-4"
                              >
                                mes tickets
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateTicket} className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-white/60 mb-2 uppercase">Sujet</label>
                            <div className="w-full bg-white/10 border border-white/5 rounded-md px-4 py-3 text-white/60 font-bold">
                              {selectedSubject}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-white/60 mb-2 uppercase">Message</label>
                            <textarea 
                              name="content"
                              required
                              className="w-full bg-white/5 border border-emerald-500/50 rounded-md px-4 py-3 focus:border-emerald-500 outline-none h-40 resize-none"
                              placeholder="Décrivez votre demande..."
                            />
                          </div>
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setTicketStep('subject')} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-md border border-white/5">Retour</button>
                            <button type="submit" className="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-md transition-all">Envoyer</button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  <div id="recent-tickets" className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-black italic flex items-center gap-2">
                      <Clock size={20} className="text-daytona-red" /> VOS TICKETS RÉCENTS
                    </h3>
                    {(() => {
                      const visibleTickets = state.user?.role === 'ADMIN' || state.user?.role === 'OWNER' || state.user?.role === 'STAFF'
                        ? state.tickets
                        : state.tickets.filter(t => t.author === state.user?.username);
                      
                      return visibleTickets.length > 0 ? (
                        visibleTickets.map((ticket) => (
                          <div 
                            key={ticket.id} 
                            onClick={() => setViewingTicket(ticket)}
                            className="glass p-6 rounded-xl border-l-4 border-daytona-red cursor-pointer hover:bg-white/5 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{ticket.id}</span>
                                <h4 className="text-lg font-bold italic group-hover:text-daytona-red transition-colors">{ticket.subject}</h4>
                              </div>
                              <span className={`px-2 py-1 rounded text-[10px] font-black italic uppercase ${
                                ticket.status === 'Ouvert' ? 'bg-emerald-500' : ticket.status === 'En cours' ? 'bg-blue-500' : 'bg-white/10'
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                            <p className="text-sm text-white/60 mb-4 line-clamp-2">{ticket.content}</p>
                            <div className="flex items-center justify-between text-[10px] font-bold text-white/30">
                              <span>PAR {ticket.author.toUpperCase()}</span>
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="glass p-12 rounded-xl text-center">
                          <p className="text-white/30 italic">Aucun ticket trouvé.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-12"
            >
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black italic tracking-tighter mb-4">RÈGLEMENTS <span className="text-daytona-red">OFFICIELS.</span></h2>
                <p className="text-white/50">Le respect des règles est la base de notre communauté.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { title: 'Règlement Général', icon: Shield, color: 'text-daytona-red' },
                  { title: 'Règlement Légal', icon: CheckCircle2, color: 'text-emerald-500' },
                  { title: 'Règlement Illégal', icon: AlertCircle, color: 'text-amber-500' },
                  { title: 'Règlement Entreprises', icon: Users, color: 'text-blue-500' }
                ].map((rule, i) => (
                  <div key={i} className="glass p-8 rounded-2xl hover:border-daytona-red/30 transition-all group">
                    <rule.icon size={40} className={`${rule.color} mb-6`} />
                    <h3 className="text-2xl font-black italic mb-4">{rule.title}</h3>
                    <p className="text-sm text-white/50 mb-8">
                      Consultez les directives officielles concernant cette catégorie sur notre GitBook dédié.
                    </p>
                    <button className="btn-secondary w-full flex items-center justify-center gap-2">
                      VOIR SUR GITBOOK <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && state.user && (state.user.role === 'ADMIN' || state.user.role === 'OWNER') && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-7xl mx-auto px-4 py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-5xl font-black italic tracking-tighter mb-2">ADMIN <span className="text-daytona-red">DASHBOARD.</span></h2>
                  <p className="text-white/50">Bienvenue, {state.user.username}. Grade : {state.user.role}</p>
                </div>
                <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold italic">SYSTÈME OPÉRATIONNEL</span>
                </div>
              </div>

              <Dashboard state={state} setState={setState} user={state.user} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer & Interactive Elements */}
      <footer className="fixed bottom-0 left-0 w-full z-40 bg-daytona-black/80 backdrop-blur-md border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-bold text-white/20 italic uppercase tracking-[0.2em]">
            © 2025 DAYTONA ELITE • ERLC ROBLOX • LOS ANGELES
          </div>

          <div className="text-[10px] font-bold text-white/20 italic uppercase tracking-[0.2em]">
            © 2025 DAYTONA ELITE • TOUS DROITS RÉSERVÉS
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuth={handleLogin}
      />
    </div>
  );
}
