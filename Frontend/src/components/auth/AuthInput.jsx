const AuthInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete = "off",
}) => {

  return (

    <div className="mb-4">

      {label && (

        <label
          htmlFor={name}
          className="
            mb-2
            block
            text-sm
            font-medium
            text-slate-700
          "
        >
          {label}
        </label>

      )}


      <input

        id={name}

        type={type}

        name={name}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        autoComplete={autoComplete}

        className="
          w-full
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-4
          py-3
          text-sm
          text-slate-900
          outline-none
          transition
          placeholder:text-slate-400
          hover:border-slate-300
          focus:border-blue-500
          focus:bg-white
          focus:ring-4
          focus:ring-blue-500/10
        "
      />

    </div>
  );
};


export default AuthInput;