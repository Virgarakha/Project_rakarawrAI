import React from "react";

const plans = [
  {
    name: "Free",
    messages: "10 messages",
    price: "$0 / month",
    benefits: [
      "Basic chat access",
      "Limited AI responses",
      "Community support"
    ],
    color: "border-gray-600"
  },
  {
    name: "Pro",
    messages: "100 messages",
    price: "$9.99 / month",
    benefits: [
      "Priority chat access",
      "Faster AI responses",
      "Email support",
      "Access to Pro features"
    ],
    color: "border-blue-500"
  },
  {
    name: "Premium",
    messages: "Unlimited messages",
    price: "$29.99 / month",
    benefits: [
      "All Pro benefits",
      "Unlimited AI responses",
      "Priority support",
      "Exclusive Premium features"
    ],
    color: "border-purple-500"
  }
];

export default function Plans() {
  return (
    <div className="min-h-screen p-6 bg-[#121212] text-white">
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border ${plan.color} rounded-xl p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300`}
          >
            <div>
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-gray-400 mb-4">{plan.price}</p>
              <p className="text-sm mb-4 font-medium">{plan.messages}</p>
              <ul className="mb-6 space-y-2">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="text-gray-300 before:content-['✔'] before:mr-2 before:text-green-500">
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-auto bg-white text-black py-2 px-4 rounded-lg font-medium transition-colors">
              Choose {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
