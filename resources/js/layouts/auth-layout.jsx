import AuthLayoutTemplate from '../layouts/auth/auth-simple-layout';
import backgroundImg from '../assets/images/background.png';
import titleImg from '../assets/images/title_login.png';

export default function AuthLayout({ children, title, description, ...props }) {
    return (<AuthLayoutTemplate title={title} description={description} imageSrc={backgroundImg} titleSrc={titleImg} {...props}>
            {children}
        </AuthLayoutTemplate>);
}

