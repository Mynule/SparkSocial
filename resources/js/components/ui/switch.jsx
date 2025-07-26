import React from "react";
 function Switch({ checked, onChange, label }) {
    return (
        <label className="flex items-center cursor-pointer space-x-2">
            <span className="text-gray-700 dark:text-gray-200">{label}</span>
            <div className="relative">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div className={`w-10 h-5 bg-gray-400 dark:bg-gray-600 rounded-full shadow-inner transition ${checked ? "bg-blue-500" : ""}`}></div>
                <div
                    className={`absolute top-1 left-1 w-3.5 h-3.5 bg-white rounded-full shadow transition ${checked ? "translate-x-5" : ""}`}
                ></div>
            </div>
        </label>
    );
}
export {Switch};
