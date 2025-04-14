"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { RegistrationProps } from "@/types/Registration";

export default function SignUpForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tin: "",
    tradingName: "",
    address: "",
    businessEmail: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await register(formData); // You can adjust this based on your API
      router.push("/");
    } catch (err) {
      setError("Sign up failed. Please check your input and try again.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 mt-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 ? "Enter your business details" : "Enter your personal details"}
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 1 ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${step === 2 ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"}`}></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 2 ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step === 1 ? "text-brand-500 font-medium" : "text-gray-500"}>Business Details</span>
              <span className={step === 2 ? "text-brand-500 font-medium" : "text-gray-500"}>Personal Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-5">
                <div>
                  <Label>TIN (Tax Identification Number)<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="tin"
                    value={formData.tin}
                    onChange={handleChange}
                    placeholder="Enter your business TIN"
                  />
                </div>
                <div>
                  <Label>Trading Name<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="tradingName"
                    value={formData.tradingName}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                  />
                </div>
                <div>
                  <Label>Business Address<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your business address"
                  />
                </div>
                <div>
                  <Label>Business Email<span className="text-error-500">*</span></Label>
                  <Input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleChange}
                    placeholder="Enter your business email"
                  />
                </div>
                <div>
                  <Label>Phone Number<span className="text-error-500">*</span></Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your business phone number"
                  />
                </div>
                <div>
                  <Button type="button" className="w-full" onClick={() => setStep(2)}>
                    Continue to Personal Details
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label>First Name<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label>Last Name<span className="text-error-500">*</span></Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <Label>Personal Email<span className="text-error-500">*</span></Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your personal email"
                  />
                </div>
                <div>
                  <Label>Password<span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center gap-3">
                  <Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked} />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    By creating an account you agree to our{" "}
                    <span className="text-gray-800 dark:text-white/90">Terms and Conditions</span> and{" "}
                    <span className="text-gray-800 dark:text-white">Privacy Policy</span>.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center w-1/3 px-4 py-3 text-sm font-medium text-gray-700 transition bg-gray-200 rounded-lg dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Back
                  </button>
                  <Button type="submit" className="w-2/3">
                    Sign Up
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-5 mb-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
