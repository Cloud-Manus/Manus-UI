import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",

    // Path to Tremor module
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	screens: {
  		xs: "390px",
  		sm: "640px",
  		md: "768px",
  		lg: "1024px",
  		xl: "1310px",
  		xxl: "1500px"
  	},
  	extend: {
  		zIndex: {
  			"999": "999",
  			"1000": "1000"
  		},
  		backgroundImage: {
  			"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
  			"gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))"
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)"
  		},
  		colors: {
  			tremor: {
  				brand: {
  					faint: colors.blue[50],
  					muted: colors.blue[200],
  					subtle: colors.blue[400],
  					DEFAULT: colors.blue[500],
  					emphasis: colors.blue[700],
  					inverted: colors.white
  				},
  				background: {
  					muted: colors.gray[50],
  					subtle: colors.gray[100],
  					DEFAULT: colors.white,
  					emphasis: colors.gray[700]
  				},
  				border: {
  					DEFAULT: colors.gray[200]
  				},
  				ring: {
  					DEFAULT: colors.gray[200]
  				},
  				content: {
  					subtle: colors.gray[400],
  					DEFAULT: colors.gray[500],
  					emphasis: colors.gray[700],
  					strong: colors.gray[900],
  					inverted: colors.white
  				}
  			},
  			"dark-tremor": {
  				brand: {
  					faint: "#0B1229",
  					muted: colors.blue[950],
  					subtle: colors.blue[800],
  					DEFAULT: colors.blue[500],
  					emphasis: colors.blue[400],
  					inverted: colors.blue[950]
  				},
  				background: {
  					muted: "#131A2B",
  					subtle: colors.gray[800],
  					DEFAULT: colors.gray[900],
  					emphasis: colors.gray[300]
  				},
  				border: {
  					DEFAULT: colors.gray[800]
  				},
  				ring: {
  					DEFAULT: colors.gray[800]
  				},
  				content: {
  					subtle: colors.gray[600],
  					DEFAULT: colors.gray[500],
  					emphasis: colors.gray[200],
  					strong: colors.gray[50],
  					inverted: colors.gray[950]
  				}
  			},
  			background: "var(--background)",
  			foreground: "var(--foreground)",
  			card: {
  				DEFAULT: "var(--card)",
  				foreground: "var(--card-foreground)"
  			},
  			popover: {
  				DEFAULT: "var(--popover)",
  				foreground: "var(--popover-foreground)"
  			},
  			primary: {
  				DEFAULT: "var(--brand-0)",
  				foreground: "var(--white)",
  				hover: "var(--brand-3)",
  				disabled: "var(--dark-6)"
  			},
  			secondary: {
  				DEFAULT: "var(--gray-2)",
  				foreground: "var(--dark-1)",
  				hover: "var(--gray-1)"
  			},
  			warn: {
  				DEFAULT: "var(--red-2)",
  				foreground: "var(--white)",
  				hover: "var(--red-3)"
  			},
  			muted: {
  				DEFAULT: "var(--muted)",
  				foreground: "var(--muted-foreground)"
  			},
  			accent: {
  				DEFAULT: "var(--gray-2)",
  				foreground: "var(--dark-1)",
  				hover: "var(--gray-2)"
  			},
  			groupbtn: {
  				DEFAULT: "var(--gray-1)",
  				foreground: "var(--dark-6)",
  				hover: "var(--dark-3)"
  			},
  			border: "var(--border)",
  			input: {
  				DEFAULT: "var(--input)",
  				hover: "var(--dark-1)"
  			},
  			ring: "var(--ring)",
  			"ring-dark": "var(--ring-dark)",
  			"ring-primary": "var(--ring-primary)",
  			chart: {
  				"1": "var(--chart-1)",
  				"2": "var(--chart-2)",
  				"3": "var(--chart-3)",
  				"4": "var(--chart-4)",
  				"5": "var(--chart-5)"
  			},
  			calendar: {
  				outside: "var(--brand-4)",
  				rangeBg: "var(--brand-6)"
  			},
  			"common-dark": {
  				"1": "var(--dark-1)",
  				"2": "var(--dark-2)",
  				"3": "var(--dark-3)",
  				"4": "var(--dark-4)",
  				"5": "var(--dark-5)",
  				"6": "var(--dark-6)",
  				"7": "var(--dark-7)"
  			},
  			"common-gray": {
  				"1": "var(--gray-1)",
  				"2": "var(--gray-2)",
  				"3": "var(--gray-3)"
  			},
  			shiki: {
  				light: "var(--shiki-light)",
  				"light-bg": "var(--shiki-light-bg)",
  				dark: "var(--shiki-dark)",
  				"dark-bg": "var(--shiki-dark-bg)"
  			}
  		},
  		keyframes: {
  			"typing-dot-bounce": {
  				"0%,40%": {
  					transform: "translateY(0)"
  				},
  				"20%": {
  					transform: "translateY(-0.25rem)"
  				}
  			},
  			"accordion-down": {
  				from: {
  					height: "0"
  				},
  				to: {
  					height: "var(--radix-accordion-content-height)"
  				}
  			},
  			"accordion-up": {
  				from: {
  					height: "var(--radix-accordion-content-height)"
  				},
  				to: {
  					height: "0"
  				}
  			},
  			"gradient-x": {
  				"0%, 100%": {
  					"background-position": "0% 50%"
  				},
  				"50%": {
  					"background-position": "100% 50%"
  				}
  			},
  			"border-rotate": {
  				"0%": {
  					transform: "rotate(0deg)"
  				},
  				"100%": {
  					transform: "rotate(360deg)"
  				}
  			}
  		},
  		animation: {
  			"typing-dot-bounce": "typing-dot-bounce 1.25s ease-out infinite",
  			"accordion-down": "accordion-down 0.2s ease-out",
  			"accordion-up": "accordion-up 0.2s ease-out",
  			"gradient": "gradient-x 3s ease infinite",
  			"rotating-border": "border-rotate 4s linear infinite"
  		},
  		fontSize: {
  			"tremor-label": [
  				"0.75rem",
  				{
  					lineHeight: "1rem"
  				}
  			],
  			"tremor-default": [
  				"0.875rem",
  				{
  					lineHeight: "1.25rem"
  				}
  			],
  			"tremor-title": [
  				"1.125rem",
  				{
  					lineHeight: "1.75rem"
  				}
  			],
  			"tremor-metric": [
  				"1.875rem",
  				{
  					lineHeight: "2.25rem"
  				}
  			]
  		}
  	}
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [animatePlugin],
};
export default config;
