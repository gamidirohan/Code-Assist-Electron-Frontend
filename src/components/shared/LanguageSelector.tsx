import React from "react";;

interface LanguageSelectorProps {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  currentLanguage: string;
  setLanguage: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  setLanguage,
  setLanguage,
}) => {
  const handleLanguageChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLanguage = e.target.value;
    const newLanguage = e.target.value;
    try {
      // Just update the language locally
      setLanguage(newLanguage);
      window.__LANGUAGE__ = newLanguage;
      setLanguage(newLanguage);
      window.__LANGUAGE__ = newLanguage;
    } catch (error) {
      console.error("Error updating language preference:", error);
      console.error("Error updating language preference:", error);
    }
  };
  };

  return (
    <div className="mb-3 px-2 space-y-1">
      <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
        <span>Language</span>
        <select
          value={currentLanguage}
          onChange={handleLanguageChange}
          className="bg-neutral-900 text-gray-300 rounded-md px-3 py-1.5 text-sm outline-none ring-0 focus:ring-2 focus:ring-blue-500 hover:bg-neutral-800 transition-all"
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="golang">Go</option>
          <option value="cpp">C++</option>
          <option value="swift">Swift</option>
          <option value="kotlin">Kotlin</option>
          <option value="ruby">Ruby</option>
          <option value="sql">SQL</option>
          <option value="r">R</option>
        </select>
      </div>
    </div>
  );
};
  );
};
