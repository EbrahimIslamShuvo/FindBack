import {
  useState,
} from "react";

import {
  FiEye,
  FiEyeOff,
} from "react-icons/fi";


const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete = "new-password",
}) => {

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


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


      <div className="relative">

        <input

          id={name}

          type={
            showPassword
              ? "text"
              : "password"
          }

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
            pr-12
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


        <button

          type="button"

          onClick={() =>
            setShowPassword(
              previous => !previous
            )
          }

          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
            transition
            hover:text-blue-600
          "
        >

          {showPassword ? (

            <FiEyeOff
              size={19}
            />

          ) : (

            <FiEye
              size={19}
            />

          )}

        </button>

      </div>

    </div>
  );
};


export default PasswordInput;