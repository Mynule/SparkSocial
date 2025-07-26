import AppLogoIcon from './app-logo-icon';
import AppearanceToggle from '@/components/appearance-toggle.jsx';
import Icon from "../components/ui/logo-icon.jsx";

export default function AppLogo() {
    return (<div className="flex items-center gap-x-2 justify-start py-2">
        <Icon />
        <div className="grid flex-1 text-left text-xl font-extrabold">
            <span className="leading-none ">Spark</span>
        </div>
    </div>);
}

