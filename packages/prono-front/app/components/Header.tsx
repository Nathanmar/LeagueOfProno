import { useState } from "react";
import { currentUser } from "../data/mockData";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
	Trophy,
	Users,
	ShoppingBag,
	Home,
	Menu,
	X,
	User,
	LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
	onNavigateToProfile: () => void;
	onNavigateToFriends: () => void;
	onNavigateToDashboard: () => void;
	onNavigateToShop: () => void;
	onLogout: () => void;
	currentView: string;
}

export function Header({
	onNavigateToProfile,
	onNavigateToFriends,
	onNavigateToDashboard,
	onNavigateToShop,
	onLogout,
	currentView,
}: HeaderProps) {
	const [isOpen, setIsOpen] = useState(false);

	const navItems = [
		{
			id: "dashboard",
			label: "Accueil",
			icon: Home,
			onClick: onNavigateToDashboard,
		},
		{ id: "friends", label: "Amis", icon: Users, onClick: onNavigateToFriends },
		{
			id: "shop",
			label: "Boutique",
			icon: ShoppingBag,
			onClick: onNavigateToShop,
		},
	];

	const handleNavClick = (onClick: () => void) => {
		onClick();
		setIsOpen(false);
	};

	return (
		<header className="border-b border-[#E5E4E1] bg-white sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6">
				<div className="flex items-center justify-between h-16">
					{/* Logo - Left */}
					<button
						onClick={onNavigateToDashboard}
						className="flex items-center gap-2 hover:opacity-80 transition-opacity"
					>
						<Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-[#548CB4]" />
						<span
							className="text-lg sm:text-xl hidden sm:block"
							style={{ fontWeight: 700 }}
						>
							League of Prono
						</span>
					</button>

					{/* Navigation - Center (Desktop) */}
					<nav className="hidden md:flex items-center gap-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive =
								currentView === item.id ||
								(item.id === "dashboard" &&
									(currentView === "dashboard" || currentView === "group"));

							return (
								<button
									key={item.id}
									onClick={item.onClick}
									className={`px-4 py-2 flex items-center gap-2 transition-all ${
										isActive
											? "text-[#548CB4] border-b-2 border-[#548CB4]"
											: "text-gray-600 hover:text-[#548CB4] border-b-2 border-transparent"
									}`}
								>
									<Icon className="w-4 h-4" />
									<span style={{ fontWeight: isActive ? 600 : 400 }}>
										{item.label}
									</span>
								</button>
							);
						})}
					</nav>

					{/* User Info - Right (Desktop) */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="hidden md:flex items-center gap-3 hover:bg-[#F5F4F1] px-3 py-2 transition-colors rounded">
								<div className="text-right">
									<div style={{ fontWeight: 600 }} className="text-sm">
										{currentUser.name}
									</div>
									<div className="text-xs text-gray-600">
										<Trophy className="w-3 h-3 inline mr-1" />
										{currentUser.total_points} points
									</div>
								</div>
								<Avatar className="w-9 h-9 border-2 border-[#548CB4]">
									<AvatarFallback className="bg-[#548CB4] text-white">
										{currentUser.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48 bg-white">
							<DropdownMenuItem
								onClick={onNavigateToProfile}
								className="cursor-pointer flex items-center gap-2"
							>
								<User className="w-4 h-4" />
								Mon profil
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={onLogout}
								className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
							>
								<LogOut className="w-4 h-4" />
								Se déconnecter
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Mobile Menu Button */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild className="md:hidden">
							<button className="p-2 hover:bg-[#F5F4F1] transition-colors rounded">
								<Menu className="w-6 h-6 text-gray-600" />
							</button>
						</SheetTrigger>
						<SheetContent
							side="right"
							className="w-[280px] sm:w-[350px] bg-white"
						>
							<SheetTitle className="sr-only">Menu de navigation</SheetTitle>
							<div className="flex flex-col h-full">
								{/* User Info */}
								<button
									onClick={() => handleNavClick(onNavigateToProfile)}
									className="flex items-center gap-3 p-4 border-b border-[#E5E4E1] hover:bg-[#F5F4F1] transition-colors"
								>
									<Avatar className="w-12 h-12 border-2 border-[#548CB4]">
										<AvatarFallback className="bg-[#548CB4] text-white">
											{currentUser.name
												.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div className="text-left">
										<div style={{ fontWeight: 600 }} className="text-sm">
											{currentUser.name}
										</div>
										<div className="text-xs text-gray-600">
											<Trophy className="w-3 h-3 inline mr-1" />
											{currentUser.total_points} points
										</div>
									</div>
								</button>

								{/* Navigation Links */}
								<nav className="flex flex-col py-4 flex-1">
									{navItems.map((item) => {
										const Icon = item.icon;
										const isActive =
											currentView === item.id ||
											(item.id === "dashboard" &&
												(currentView === "dashboard" ||
													currentView === "group"));

										return (
											<button
												key={item.id}
												onClick={() => handleNavClick(item.onClick)}
												className={`px-4 py-3 flex items-center gap-3 transition-colors ${
													isActive
														? "bg-[#548CB4]/10 text-[#548CB4] border-r-4 border-[#548CB4]"
														: "text-gray-600 hover:bg-[#F5F4F1]"
												}`}
											>
												<Icon className="w-5 h-5" />
												<span style={{ fontWeight: isActive ? 600 : 400 }}>
													{item.label}
												</span>
											</button>
										);
									})}
								</nav>

								{/* Logout Button (Mobile) */}
								<div className="border-t border-[#E5E4E1] pt-4">
									<button
										onClick={() => handleNavClick(onLogout)}
										className="px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors w-full"
									>
										<LogOut className="w-5 h-5" />
										<span style={{ fontWeight: 400 }}>Se déconnecter</span>
									</button>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
