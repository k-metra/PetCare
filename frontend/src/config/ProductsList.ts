import royalcaninhairball from "../assets/products/royalcaninhairball.png";
import royalcaninhypoallergenic from "../assets/products/royalcaninhypoallergenic.png"
import royalcanindermacomfort from "../assets/products/royalcanindermacomfort.png"
import royalcaninrenal from "../assets/products/royalcaninrenal.png"
import nutrivet from "../assets/products/nutrivet.png"
import empresscatlitter from "../assets/products/empresscatlitter.png"
import royalcaninurinary from "../assets/products/royalcaninurinary.png"
import royalcaninurinaryso from "../assets/products/royalcaninurinaryso.png"

type ProductDetails = {
    img: string;
    title: string;
    description?: string | null;
    price: string;
}

export const productsList: ProductDetails[] = [
    {
        img: royalcaninhairball,
        title: "Royal Canin Hairball Care 85g",
        description: "Specially formulated to reduce hairballs in cats.",
        price: "₱100.00"
    },
    {
        img: royalcaninhypoallergenic,
        title: "Royal Canin Hypoallergenic 85g",
        description: "Dietary management for dogs with food sensitivities.",
        price: "₱1299.00"
    },
    {
        img: royalcanindermacomfort,
        title: "Royal Canin Derma Comfort 85g",
        description: "Supports skin health and reduces itching in dogs.",
        price: "₱1199.00"
    },
    {
        img: royalcaninurinary,
        title: "Royal Canin Urinary 85g",
        description: "Helps dissolve struvite stones and prevent their recurrence in cats.",
        price: "₱100.00"
    },
    {
        img: royalcaninurinaryso,
        title: "Royal Canin Urinary S/O 85g",
        description: "Supports urinary tract health in cats.",
        price: "₱1100.00"
    },
    {
        img: royalcaninrenal,
        title: "Royal Canin Renal 2kg",
        description: "Dietary support for cats with chronic kidney disease.",
        price: "₱1620.00"
    },
    {
        img: empresscatlitter,
        title: "Empress Cat Litter 5L",
        description: "Clumping cat litter with superior odor control.",
        price: "₱250.00"
    }
]