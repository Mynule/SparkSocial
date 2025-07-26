import { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Users, ShieldCheck } from "lucide-react";

export default function FollowLayout({ children }) {
    const [activeTab, setActiveTab] = useState("followers");

    const tabs = [
        { key: "followers", label: "Followers", icon: <Users className="w-5 h-5" /> },
        { key: "following", label: "Following", icon: <UserCheck className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-full">
            <div className="flex flex-col space-y-2 border-r border-gray-700 p-4 w-1/4 min-w-[180px]">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-md text-white transition ${
                            activeTab === tab.key ? "bg-blue-500" : "hover:bg-gray-800"
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex-1 p-6"
            >
                {children(activeTab)}
            </motion.div>
        </div>
    );
}
