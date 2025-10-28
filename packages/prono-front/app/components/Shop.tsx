import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
	Gift,
	ShoppingCart,
	Trophy,
	Check,
	Package,
	CreditCard,
	Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ShopProps {
	onBack: () => void;
	isAuthenticated: boolean;
	onLogin?: () => void;
}

interface GiftCard {
	id: string;
	name: string;
	description: string;
	icon: string;
	values: number[];
	costPerPoint: number;
}

interface MerchItem {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	category: "riot" | "league-of-prono";
	inStock: boolean;
}

const giftCards: GiftCard[] = [
	{
		id: "amazon",
		name: "Amazon",
		description: "Carte cadeau Amazon - Utilisable sur tout le catalogue",
		icon: "🛒",
		values: [5, 10, 25, 50],
		costPerPoint: 1,
	},
	{
		id: "riot",
		name: "Riot Points",
		description: "Riot Points - Pour League of Legends et Valorant",
		icon: "🎮",
		values: [10, 20, 50, 100],
		costPerPoint: 1,
	},
	{
		id: "psn",
		name: "PlayStation Network",
		description: "Carte PSN - Pour votre compte PlayStation",
		icon: "🎯",
		values: [10, 20, 50],
		costPerPoint: 1.1,
	},
	{
		id: "steam",
		name: "Steam",
		description: "Carte Steam - Pour votre bibliothèque de jeux PC",
		icon: "💨",
		values: [5, 10, 25, 50],
		costPerPoint: 1,
	},
];

const merchItems: MerchItem[] = [
	{
		id: "riot_tshirt",
		name: "T-shirt Riot Games",
		description: "T-shirt officiel Riot Games avec logo brodé",
		price: 29.99,
		image:
			"https://images.unsplash.com/photo-1629917629391-47d9209b7c19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NjE1NzU0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "riot",
		inStock: true,
	},
	{
		id: "riot_hoodie",
		name: "Hoodie League of Legends",
		description: "Sweat à capuche premium avec logo LoL",
		price: 54.99,
		image:
			"https://images.unsplash.com/photo-1629917629391-47d9209b7c19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NjE1NzU0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "riot",
		inStock: true,
	},
	{
		id: "riot_cap",
		name: "Casquette Riot",
		description: "Casquette snapback ajustable",
		price: 24.99,
		image:
			"https://images.unsplash.com/photo-1629917629391-47d9209b7c19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NjE1NzU0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "riot",
		inStock: false,
	},
	{
		id: "lop_plush_1",
		name: "Peluche Trophy Master",
		description: "Peluche exclusive League of Prono - Trophy mascotte",
		price: 34.99,
		image:
			"https://images.unsplash.com/photo-1641085809270-71f722611ce1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMHRveSUyMGN1dGV8ZW58MXx8fHwxNzYxNTc1NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "league-of-prono",
		inStock: true,
	},
	{
		id: "lop_plush_2",
		name: "Peluche Prono Champion",
		description: "Peluche exclusive League of Prono - Edition limitée",
		price: 39.99,
		image:
			"https://images.unsplash.com/photo-1641085809270-71f722611ce1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVzaCUyMHRveSUyMGN1dGV8ZW58MXx8fHwxNzYxNTc1NDkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "league-of-prono",
		inStock: true,
	},
	{
		id: "lop_tshirt",
		name: "T-shirt League of Prono",
		description: "T-shirt officiel avec logo League of Prono",
		price: 24.99,
		image:
			"https://images.unsplash.com/photo-1629917629391-47d9209b7c19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtZXJjaGFuZGlzZXxlbnwxfHx8fDE3NjE1NzU0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		category: "league-of-prono",
		inStock: true,
	},
];

export function Shop({ onBack, isAuthenticated, onLogin }: ShopProps) {
	const { user } = useAuth();
	const [selectedGiftCard, setSelectedGiftCard] = useState<string | null>(null);
	const [selectedValue, setSelectedValue] = useState<number | null>(null);

	const handleRedeemGiftCard = (card: GiftCard, value: number) => {
		if (!isAuthenticated) {
			toast.error("Vous devez être connecté pour échanger des points");
			return;
		}

		const totalCost = value * card.costPerPoint;

		if (user?.id) {
			toast.success(
				`Carte cadeau ${card.name} de ${value}€ échangée avec succès !`,
			);
			setSelectedGiftCard(null);
			setSelectedValue(null);
		} else {
			toast.error(`Points insuffisants. Il vous faut ${totalCost} points.`);
		}
	};

	const handlePurchaseMerch = (item: MerchItem) => {
		if (!isAuthenticated) {
			toast.error("Vous devez être connecté pour acheter");
			return;
		}

		if (!item.inStock) {
			toast.error("Cet article est en rupture de stock");
			return;
		}
		toast.success(`${item.name} ajouté au panier !`);
	};

	return (
		<div>
			{/* Navbar for non-authenticated users */}
			{!isAuthenticated && (
				<nav className="bg-white border-b border-[#E5E4E1] sticky top-0 z-50">
					<div className="max-w-7xl mx-auto px-6">
						<div className="flex items-center justify-between h-16">
							{/* Logo */}
							<button
								type="button"
								onClick={onBack}
								className="flex items-center gap-2 hover:opacity-80 transition-opacity"
							>
								<Trophy className="w-8 h-8 text-[#548CB4]" />
								<span className="text-xl" style={{ fontWeight: 700 }}>
									League of Prono
								</span>
							</button>

							{/* Auth Button */}
							<Button
								onClick={onLogin}
								className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
							>
								Connexion / Inscription
							</Button>
						</div>
					</div>
				</nav>
			)}

			<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
				{/* Header */}
				<div className="mb-8 sm:mb-12">
					<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
						<div>
							<h1 className="mb-3">Boutique</h1>
							<p className="text-gray-600">
								Échangez vos points ou achetez du merch exclusif
							</p>
						</div>

						{isAuthenticated ? (
							<div className="bg-linear-to-br from-[#548CB4] to-[#4a7ca0] text-white px-6 py-4 self-start">
								<div className="text-sm opacity-90">Vos points</div>
								<div className="flex items-center gap-2">
									<Trophy className="w-6 h-6" />
									<span className="text-3xl" style={{ fontWeight: 700 }}>
										{user?.id ? user.total_points : "0"}
									</span>
								</div>
							</div>
						) : (
							<Button
								onClick={onLogin}
								className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white px-6 py-3 w-full sm:w-auto"
							>
								<Lock className="w-4 h-4 mr-2" />
								Connexion pour acheter
							</Button>
						)}
					</div>
				</div>

				{/* Tabs */}
				<Tabs defaultValue="gift-cards" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F5F4F1] border border-[#E5E4E1]">
						<TabsTrigger
							value="gift-cards"
							className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
						>
							<Gift className="w-4 h-4 mr-2" />
							Échange de points
						</TabsTrigger>
						<TabsTrigger
							value="merch"
							className="data-[state=active]:bg-[#548CB4] data-[state=active]:text-white"
						>
							<ShoppingCart className="w-4 h-4 mr-2" />
							Boutique Merch
						</TabsTrigger>
					</TabsList>

					{/* Échange de points */}
					<TabsContent value="gift-cards">
						{!isAuthenticated && (
							<div className="bg-[#548CB4] bg-opacity-10 border-2 border-[#548CB4] p-6 mb-8">
								<div className="flex items-start gap-3">
									<Lock className="w-5 h-5 text-[#548CB4] mt-1" />
									<div>
										<h4 className="mb-1 text-[#548CB4]">Connexion requise</h4>
										<p className="text-sm text-gray-700 mb-3">
											Connectez-vous pour échanger vos points contre des cartes
											cadeaux.
										</p>
										<Button
											onClick={onLogin}
											className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
											size="sm"
										>
											Se connecter
										</Button>
									</div>
								</div>
							</div>
						)}

						<div className="bg-[#F5F4F1] p-6 mb-8 border-l-4 border-[#548CB4]">
							<div className="flex items-start gap-3">
								<CreditCard className="w-5 h-5 text-[#548CB4] mt-1" />
								<div>
									<h4 className="mb-1">Comment ça marche ?</h4>
									<p className="text-sm text-gray-600">
										Échangez vos points gagnés en faisant des pronostics contre
										des cartes cadeaux digitales. Les codes vous seront envoyés
										par email sous 24h.
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
							{giftCards.map((card) => (
								<div
									key={card.id}
									className="bg-white border border-[#E5E4E1] p-6 hover:border-[#548CB4] transition-colors"
								>
									<div className="flex items-start gap-4 mb-6">
										<div className="text-5xl">{card.icon}</div>
										<div className="flex-1">
											<h3 className="mb-1">{card.name}</h3>
											<p className="text-sm text-gray-600">
												{card.description}
											</p>
										</div>
									</div>

									<div className="space-y-3">
										<div className="text-sm text-gray-600 mb-2">
											Sélectionnez un montant :
										</div>
										<div className="grid grid-cols-2 gap-2">
											{card.values.map((value) => {
												const cost = value * card.costPerPoint;
												const canAfford = isAuthenticated && user?.id;

												return (
													<button
														type="button"
														key={value}
														onClick={() => {
															if (!isAuthenticated) {
																toast.error("Vous devez être connecté");
																return;
															}
															setSelectedGiftCard(card.id);
															setSelectedValue(value);
														}}
														className={`p-4 border-2 transition-all ${
															selectedGiftCard === card.id &&
															selectedValue === value
																? "border-[#548CB4] bg-[#548CB4] bg-opacity-10"
																: isAuthenticated && canAfford
																	? "border-[#E5E4E1] hover:border-[#548CB4]"
																	: "border-[#E5E4E1] opacity-50 cursor-not-allowed"
														}`}
														disabled={!isAuthenticated || !canAfford}
													>
														<div
															style={{ fontWeight: 700 }}
															className="text-lg mb-1"
														>
															{value}€
														</div>
														<div className="text-xs text-gray-600">
															{cost} points
														</div>
													</button>
												);
											})}
										</div>

										{selectedGiftCard === card.id && selectedValue !== null && (
											<Button
												onClick={() =>
													handleRedeemGiftCard(card, selectedValue)
												}
												className="w-full bg-[#548CB4] hover:bg-[#4a7ca0] text-white"
											>
												<Check className="w-4 h-4 mr-2" />
												Échanger contre {selectedValue}€
											</Button>
										)}
									</div>
								</div>
							))}
						</div>
					</TabsContent>

					{/* Boutique Merch */}
					<TabsContent value="merch">
						<div className="bg-[#F5F4F1] p-6 mb-8 border-l-4 border-[#C4A15B]">
							<div className="flex items-start gap-3">
								<Package className="w-5 h-5 text-[#C4A15B] mt-1" />
								<div>
									<h4 className="mb-1">Boutique officielle</h4>
									<p className="text-sm text-gray-600">
										Découvrez notre sélection de produits Riot Games et nos
										articles exclusifs League of Prono. Livraison offerte dès
										50€ d'achat.
									</p>
								</div>
							</div>
						</div>

						{/* Riot Merch */}
						<div className="mb-12">
							<h2 className="mb-6">Produits Riot Games</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
								{merchItems
									.filter((item) => item.category === "riot")
									.map((item) => (
										<div
											key={item.id}
											className="bg-white border border-[#E5E4E1] overflow-hidden hover:border-[#548CB4] transition-colors"
										>
											<div className="relative aspect-square bg-gray-100">
												<ImageWithFallback
													src={item.image}
													alt={item.name}
													className="w-full h-full object-cover"
												/>
												{!item.inStock && (
													<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
														<Badge variant="secondary" className="bg-white">
															Rupture de stock
														</Badge>
													</div>
												)}
											</div>

											<div className="p-4">
												<h4 className="mb-1">{item.name}</h4>
												<p className="text-sm text-gray-600 mb-4">
													{item.description}
												</p>

												<div className="flex items-center justify-between">
													<span
														className="text-2xl"
														style={{ fontWeight: 700 }}
													>
														{item.price.toFixed(2)}€
													</span>
													<Button
														onClick={() => handlePurchaseMerch(item)}
														disabled={!item.inStock}
														className="bg-[#548CB4] hover:bg-[#4a7ca0] text-white disabled:opacity-50"
													>
														<ShoppingCart className="w-4 h-4 mr-2" />
														Acheter
													</Button>
												</div>
											</div>
										</div>
									))}
							</div>
						</div>

						{/* League of Prono Merch */}
						<div>
							<h2 className="mb-6">Produits League of Prono</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
								{merchItems
									.filter((item) => item.category === "league-of-prono")
									.map((item) => (
										<div
											key={item.id}
											className="bg-white border border-[#E5E4E1] overflow-hidden hover:border-[#C4A15B] transition-colors"
										>
											<div className="relative aspect-square bg-gray-100">
												<ImageWithFallback
													src={item.image}
													alt={item.name}
													className="w-full h-full object-cover"
												/>
												{!item.inStock && (
													<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
														<Badge variant="secondary" className="bg-white">
															Rupture de stock
														</Badge>
													</div>
												)}
												<Badge className="absolute top-3 right-3 bg-[#C4A15B] text-white">
													Exclusif
												</Badge>
											</div>

											<div className="p-4">
												<h4 className="mb-1">{item.name}</h4>
												<p className="text-sm text-gray-600 mb-4">
													{item.description}
												</p>

												<div className="flex items-center justify-between">
													<span
														className="text-2xl"
														style={{ fontWeight: 700 }}
													>
														{item.price.toFixed(2)}€
													</span>
													<Button
														onClick={() => handlePurchaseMerch(item)}
														disabled={!item.inStock}
														className="bg-[#C4A15B] hover:bg-[#b8955a] text-white disabled:opacity-50"
													>
														<ShoppingCart className="w-4 h-4 mr-2" />
														Acheter
													</Button>
												</div>
											</div>
										</div>
									))}
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
