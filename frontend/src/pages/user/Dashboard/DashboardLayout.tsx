import React from 'react';
import { Typography } from '@mui/material';
import MainLayout from '../../../components/layouts/MainLayout';
import { useThemeContext } from '../../../context/ThemeContext';

type DashboardLayoutProps = {
	title: string;
	subtitle: string;
	children: React.ReactNode;
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, children }) => {
	const { mode } = useThemeContext();
	const isLight = mode === 'light';

	return (
		<MainLayout>
			<div className="relative min-h-screen w-full overflow-hidden">
				{/* Massive SaaS Background Glows */}
				<div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
					<div className={`absolute -top-[10%] -left-[5%] w-[50vw] h-[50vw] rounded-full blur-[120px] ${isLight ? 'opacity-50' : 'opacity-20'} bg-indigo-500/40 mix-blend-screen`}></div>
					<div className={`absolute top-[10%] -right-[5%] w-[40vw] h-[40vw] rounded-full blur-[120px] ${isLight ? 'opacity-50' : 'opacity-20'} bg-pink-500/30 mix-blend-screen`}></div>
					<div className={`absolute -bottom-[10%] left-[15%] w-[60vw] h-[60vw] rounded-full blur-[150px] ${isLight ? 'opacity-40' : 'opacity-15'} bg-purple-500/30 mix-blend-screen`}></div>
				</div>

				<div className="relative z-10 mx-auto max-w-7xl space-y-6 px-2 py-2 sm:px-4">
					<div>
						<Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
							{title}
						</Typography>
						<Typography variant="body1" sx={{ mt: 1, color: 'text.secondary', maxWidth: 760 }}>
							{subtitle}
						</Typography>
					</div>

					{children}
				</div>
			</div>
		</MainLayout>
	);
};

export default DashboardLayout;
