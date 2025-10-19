import {Link} from "react-router";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">DesignLens</p>
            </Link>
            <Link to="/upload" className=" black-gradient text-white rounded-full px-4 py-2 cursor-pointer  ">
                Upload Resume
            </Link>
        </nav>
    )
}
export default Navbar
