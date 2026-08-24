import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages, Building } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CardBox from '../shared/CardBox';

const ADMIN_LOGIN_PATH = '/dashboard/login';

const Register = () => {
    const { register, isAuthenticated, loading: authLoading } = useAuth();
    const { isDarkMode, toggleTheme, language, changeLanguage } = useTheme();
    const { t } = useTranslation();
    const { showToast } = useNotification();
    const navigate = useNavigate();
    
    const [role] = useState('STORE');
    const [formData, setFormData] = useState({
        name: '',
        family_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const data = { ...formData, role };
        const result = await register(data);

        if (result.success) {
            setSuccess(true);
            showToast(t('auth.register.successToast') || 'Registration successful!', 'success');
        } else {
            if (result.errors) {
                setErrors(result.errors);
            } else {
                setErrors({ general: result.message });
            }
        }
        setLoading(false);
    };

    const renderCommonFields = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{t('auth.register.firstName')}</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} required placeholder="John" className="bg-muted/30 border-border/50 rounded-xl" />
                    {errors.name && <p className="text-error text-[10px] px-1 font-bold">{errors.name[0]}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{t('auth.register.lastName')}</Label>
                    <Input name="family_name" value={formData.family_name} onChange={handleChange} required placeholder="Doe" className="bg-muted/30 border-border/50 rounded-xl" />
                    {errors.family_name && <p className="text-error text-[10px] px-1 font-bold">{errors.family_name[0]}</p>}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{t('auth.register.email')}</Label>
                <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" className="bg-muted/30 border-border/50 rounded-xl" />
                {errors.email && <p className="text-error text-[10px] px-1 font-bold">{errors.email[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{t('auth.register.password')}</Label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="bg-muted/30 border-border/50 rounded-xl" />
                    {errors.password && <p className="text-error text-[10px] px-1 font-bold">{errors.password[0]}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">{t('auth.register.confirmPassword')}</Label>
                    <Input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required placeholder="••••••••" className="bg-muted/30 border-border/50 rounded-xl" />
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen w-full flex flex-col justify-center items-center bg-background text-foreground transition-colors duration-500 relative overflow-hidden py-12">
            
            {/* Background */}
            <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-primary/30 via-blue-400/20 to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-tr from-secondary/30 via-primary/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

            {/* Top Bar */}
            <div className="absolute top-6 right-6 flex items-center gap-3 z-50 px-4 py-2 bg-background/40 backdrop-blur-md rounded-full border border-border/50 shadow-sm">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconsm" rounded="full"><Languages className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover/90 backdrop-blur-lg border-border">
                        <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('fr')}>Français</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('ar')}>العربية</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="w-[1px] h-4 bg-border" />
                <Button variant="ghost" size="iconsm" rounded="full" onClick={toggleTheme}>
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
            </div>

            {/* Register Card */}
            <div className="relative z-10 w-full max-w-[550px] px-6">
                <CardBox className="p-0 backdrop-blur-2xl bg-card/75 border-border/60 shadow-2xl overflow-hidden rounded-[32px]">
                    <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-400 to-secondary opacity-80" />
                    
                    <div className="p-10">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-primary animate-pulse"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
                                </div>
                                <h2 className="text-3xl font-black text-foreground mb-4">{t('auth.register.successTitle')}</h2>
                                <p className="text-muted-foreground mb-8 text-lg">{t('auth.register.successOther')}</p>
                                <Button asChild size="hero" rounded="2xl" className="text-lg font-bold shadow-xl shadow-primary/20">
                                    <Link to={ADMIN_LOGIN_PATH}>{t('auth.register.goToLogin')}</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-10">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Building className="w-8 h-8 text-primary" />
                                    </div>
                                    <h1 className="text-3xl font-black text-foreground mb-2">{t('auth.register.storeTitle') || 'Store Registration'}</h1>
                                    <p className="text-muted-foreground font-medium text-sm">{t('auth.register.storeSubtitle') || 'Create your store account to start selling'}</p>
                                </div>

                                <div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {renderCommonFields()}

                                        {errors.general && <div className="p-4 bg-error/10 text-error rounded-xl text-sm font-bold border border-error/20">{errors.general}</div>}

                                        <Button type="submit" disabled={loading} size="hero" rounded="2xl" className="text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                                        </Button>
                                    </form>
                                </div>

                                <div className="mt-10 pt-8 border-t border-border/50 text-center space-y-3">
                                    <p className="text-muted-foreground font-medium">
                                        {t('auth.register.haveAccount')} <Link to={ADMIN_LOGIN_PATH} className="text-primary font-bold hover:text-primaryemphasis ml-1">{t('auth.register.signIn')}</Link>
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {t('auth.register.customerHint', { defaultValue: 'Customer account?' })}{' '}
                                        <a href="/register" className="text-primary font-bold hover:underline">{t('auth.register.customerSignup', { defaultValue: 'Sign up on the shop' })}</a>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </CardBox>
            </div>
        </div>
    );
};

export default Register;
