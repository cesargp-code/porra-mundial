import type { ComponentType, ReactElement, ReactNode } from "react";

type FlagSvgProps = { id: string };

function ClipFlag({ id, children }: { id: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%">
      <defs>
        <clipPath id={id}>
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </svg>
  );
}

const FlagALG = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="30" height="60" fill="#006233" />
    <rect x="30" width="30" height="60" fill="#FFFFFF" />
    <circle cx="32" cy="30" r="9" fill="#D21034" />
    <circle cx="35" cy="30" r="7" fill="#FFFFFF" />
    <polygon points="40,30 36,32 38,28 35,25 39,25 40,21 41,25 45,25 42,28 44,32" fill="#D21034" />
  </ClipFlag>
);

const FlagARG = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#74ACDF" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#74ACDF" />
    <circle cx="30" cy="30" r="4" fill="#F6B40E" />
  </ClipFlag>
);

const FlagAUS = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#012169" />
    <rect y="13" width="30" height="4" fill="#FFFFFF" />
    <rect x="13" width="4" height="30" fill="#FFFFFF" />
    <rect y="14" width="30" height="2" fill="#CE1124" />
    <rect x="14" width="2" height="30" fill="#CE1124" />
    <circle cx="15" cy="42" r="4" fill="#FFFFFF" />
    <circle cx="42" cy="20" r="2" fill="#FFFFFF" />
    <circle cx="48" cy="32" r="1.5" fill="#FFFFFF" />
    <circle cx="40" cy="40" r="1.5" fill="#FFFFFF" />
    <circle cx="50" cy="44" r="1.5" fill="#FFFFFF" />
  </ClipFlag>
);

const FlagAUT = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#C8102E" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#C8102E" />
  </ClipFlag>
);

const FlagBEL = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="20" height="60" fill="#000000" />
    <rect x="20" width="20" height="60" fill="#FAE042" />
    <rect x="40" width="20" height="60" fill="#ED2939" />
  </ClipFlag>
);

const FlagBIH = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#002F6C" />
    <polygon points="6,60 60,6 60,60" fill="#FECB00" />
  </ClipFlag>
);

const FlagBRA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#009C3B" />
    <polygon points="30,10 52,30 30,50 8,30" fill="#FFDF00" />
    <circle cx="30" cy="30" r="8" fill="#002776" />
  </ClipFlag>
);

const FlagCAN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="15" height="60" fill="#FF0000" />
    <rect x="15" width="30" height="60" fill="#FFFFFF" />
    <rect x="45" width="15" height="60" fill="#FF0000" />
    <path
      d="M30 13.5 33.1 20.1 36.5 18.3 35.1 25.6 41.6 23.4 39.4 28.2 43 30.2 36.1 35.9 37.5 40.2 31.5 38.9 31.5 46.5 28.5 46.5 28.5 38.9 22.5 40.2 23.9 35.9 17 30.2 20.6 28.2 18.4 23.4 24.9 25.6 23.5 18.3 26.9 20.1Z"
      fill="#FF0000"
      stroke="#FF0000"
      strokeLinejoin="round"
      strokeWidth="0.8"
      transform="translate(3.6 3.6) scale(0.88)"
    />
  </ClipFlag>
);

const FlagCIV = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="20" height="60" fill="#F77F00" />
    <rect x="20" width="20" height="60" fill="#FFFFFF" />
    <rect x="40" width="20" height="60" fill="#009E60" />
  </ClipFlag>
);

const FlagCOD = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#007FFF" />
    <polygon points="0,55 50,0 60,0 60,5 10,60 0,60" fill="#FFD700" />
    <polygon points="2,55 50,2 58,2 58,4 9,58 2,58" fill="#CE1021" />
    <polygon
      points="13,11 15,16 20,16 16,19 17,24 13,21 9,24 10,19 6,16 11,16"
      fill="#FFD700"
    />
  </ClipFlag>
);

const FlagCOL = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="30" fill="#FCD116" />
    <rect y="30" width="60" height="15" fill="#003893" />
    <rect y="45" width="60" height="15" fill="#CE1021" />
  </ClipFlag>
);

const FlagCPV = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#003893" />
    <rect y="32" width="60" height="14" fill="#FFFFFF" />
    <rect y="38" width="60" height="2" fill="#CF2027" />
    <polygon
      points="22,42 23,45 26,45 24,47 25,50 22,48 19,50 20,47 18,45 21,45"
      fill="#FFD500"
    />
  </ClipFlag>
);

const FlagCRO = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#FF0000" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#171796" />
    <rect x="25" y="22" width="10" height="10" fill="#FF0000" stroke="#fff" strokeWidth="0.5" />
  </ClipFlag>
);

const FlagCUW = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#002B7F" />
    <rect y="38" width="60" height="6" fill="#FECB00" />
    <polygon
      points="14,16 16,20 20,20 17,23 18,27 14,25 10,27 11,23 8,20 12,20"
      fill="#FFFFFF"
    />
    <polygon
      points="22,10 23,13 26,13 24,15 25,18 22,16 19,18 20,15 18,13 21,13"
      fill="#FFFFFF"
    />
  </ClipFlag>
);

const FlagCZE = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="30" fill="#FFFFFF" />
    <rect y="30" width="60" height="30" fill="#D7141A" />
    <polygon points="0,0 30,30 0,60" fill="#11457E" />
  </ClipFlag>
);

const FlagECU = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="30" fill="#FFD100" />
    <rect y="30" width="60" height="15" fill="#0072CE" />
    <rect y="45" width="60" height="15" fill="#EF3340" />
  </ClipFlag>
);

const FlagEGY = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#CE1126" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#000000" />
    <circle cx="30" cy="30" r="4" fill="#C09300" />
  </ClipFlag>
);

const FlagENG = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FFFFFF" />
    <rect x="25" width="10" height="60" fill="#CE1124" />
    <rect y="25" width="60" height="10" fill="#CE1124" />
  </ClipFlag>
);

const FlagESP = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#C60B1E" />
    <rect y="15" width="60" height="30" fill="#FFC400" />
    <g strokeLinejoin="round">
      <g stroke="#AA151B" strokeWidth="0.7">
        <path d="M11.5 24.5h2.5v12h-2.5zM10.8 23h3.9v2h-3.9zM10.8 36h3.9v2h-3.9z" fill="#F1F0E6" />
        <path d="M25 24.5h2.5v12H25zM24.3 23h3.9v2h-3.9zM24.3 36h3.9v2h-3.9z" fill="#F1F0E6" />
      </g>
      <path d="M14.8 23h9.4v10.2c0 4.4-3.1 7.1-4.7 7.8-1.6-.7-4.7-3.4-4.7-7.8Z" fill="#AA151B" stroke="#7A1017" strokeWidth="0.7" />
      <path d="M15.7 23.9h3.4v5h-3.4zM19.9 23.9h3.4v5h-3.4z" fill="#F1BF00" />
      <path d="M15.7 29.7h3.4v4.3h-3.4z" fill="#F1BF00" />
      <path d="M19.9 29.7h3.4v4.3h-3.4z" fill="#F1F0E6" />
      <path d="M15.8 34.7h7.4c-.5 2.2-2.2 4.1-3.7 5-1.5-.9-3.2-2.8-3.7-5Z" fill="#F1BF00" />
      <ellipse cx="19.5" cy="32" rx="1.25" ry="2.2" fill="#00529F" stroke="#F1F0E6" strokeWidth="0.5" />
      <path d="M15.3 21.2 17 18.8l2.5 2 2.5-2 1.7 2.4-1.2 1.6h-6Z" fill="#F1BF00" stroke="#AA151B" strokeWidth="0.7" />
      <circle cx="17" cy="18.7" r="0.8" fill="#F1BF00" stroke="#AA151B" strokeWidth="0.5" />
      <circle cx="19.5" cy="18.1" r="0.8" fill="#F1BF00" stroke="#AA151B" strokeWidth="0.5" />
      <circle cx="22" cy="18.7" r="0.8" fill="#F1BF00" stroke="#AA151B" strokeWidth="0.5" />
    </g>
  </ClipFlag>
);

const FlagFRA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="20" height="60" fill="#0055A4" />
    <rect x="20" width="20" height="60" fill="#FFFFFF" />
    <rect x="40" width="20" height="60" fill="#EF4135" />
  </ClipFlag>
);

const FlagGER = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#000000" />
    <rect y="20" width="60" height="20" fill="#DD0000" />
    <rect y="40" width="60" height="20" fill="#FFCE00" />
  </ClipFlag>
);

const FlagGHA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#CE1126" />
    <rect y="20" width="60" height="20" fill="#FCD116" />
    <rect y="40" width="60" height="20" fill="#006B3F" />
    <polygon
      points="30,24 32,30 38,30 33,34 35,40 30,36 25,40 27,34 22,30 28,30"
      fill="#000000"
    />
  </ClipFlag>
);

const FlagHAI = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="30" fill="#00209F" />
    <rect y="30" width="60" height="30" fill="#D21034" />
    <rect x="22" y="22" width="16" height="16" fill="#FFFFFF" />
    <circle cx="30" cy="30" r="4" fill="#00209F" />
  </ClipFlag>
);

const FlagIRN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#239F40" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#DA0000" />
    <circle cx="30" cy="30" r="3" fill="#DA0000" />
  </ClipFlag>
);

const FlagIRQ = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#CE1126" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#000000" />
    <text
      x="30"
      y="33"
      textAnchor="middle"
      fontSize="6"
      fontWeight="700"
      fill="#007A3D"
      fontFamily="serif"
    >
      ﷲ
    </text>
  </ClipFlag>
);

const FlagJOR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#000000" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#007A3D" />
    <polygon points="0,0 30,30 0,60" fill="#CE1126" />
    <polygon
      points="11,28 12,31 15,31 13,33 14,36 11,34 8,36 9,33 7,31 10,31"
      fill="#FFFFFF"
    />
  </ClipFlag>
);

const FlagJPN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FFFFFF" />
    <circle cx="30" cy="30" r="12" fill="#BC002D" />
  </ClipFlag>
);

const FlagKOR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FFFFFF" />
    <circle cx="30" cy="30" r="10.5" fill="#CD2E3A" />
    <path
      d="M19.5 30A10.5 10.5 0 0 0 40.5 30 5.25 5.25 0 0 1 30 30 5.25 5.25 0 0 0 19.5 30Z"
      fill="#0047A0"
    />
    <g fill="#000000">
      <g transform="rotate(-34 15 15)">
        <rect x="9" y="11" width="12" height="2" />
        <rect x="9" y="14" width="12" height="2" />
        <rect x="9" y="17" width="12" height="2" />
      </g>
      <g transform="rotate(34 45 15)">
        <rect x="39" y="11" width="5" height="2" />
        <rect x="46" y="11" width="5" height="2" />
        <rect x="39" y="14" width="12" height="2" />
        <rect x="39" y="17" width="5" height="2" />
        <rect x="46" y="17" width="5" height="2" />
      </g>
      <g transform="rotate(34 15 45)">
        <rect x="9" y="41" width="12" height="2" />
        <rect x="9" y="44" width="5" height="2" />
        <rect x="16" y="44" width="5" height="2" />
        <rect x="9" y="47" width="12" height="2" />
      </g>
      <g transform="rotate(-34 45 45)">
        <rect x="39" y="41" width="5" height="2" />
        <rect x="46" y="41" width="5" height="2" />
        <rect x="39" y="44" width="5" height="2" />
        <rect x="46" y="44" width="5" height="2" />
        <rect x="39" y="47" width="5" height="2" />
        <rect x="46" y="47" width="5" height="2" />
      </g>
    </g>
  </ClipFlag>
);

const FlagKSA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#006C35" />
    <rect x="10" y="28" width="40" height="2" fill="#FFFFFF" />
    <rect x="14" y="33" width="32" height="1.5" fill="#FFFFFF" />
    <rect x="14" y="38" width="20" height="1.5" fill="#FFFFFF" />
    <rect x="36" y="38" width="10" height="1.5" fill="#FFFFFF" />
  </ClipFlag>
);

const FlagMAR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#C1272D" />
    <polygon
      points="30,15 35,28 49,28 38,36 42,49 30,41 18,49 22,36 11,28 25,28"
      fill="none"
      stroke="#006233"
      strokeWidth="2"
    />
  </ClipFlag>
);

const FlagMEX = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="20" height="60" fill="#006847" />
    <rect x="20" width="20" height="60" fill="#FFFFFF" />
    <rect x="40" width="20" height="60" fill="#CE1126" />
    <circle cx="30" cy="30" r="5" fill="none" stroke="#8B4513" strokeWidth="1.2" />
  </ClipFlag>
);

const FlagNED = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#AE1C28" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#21468B" />
  </ClipFlag>
);

const FlagNOR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#EF2B2D" />
    <rect y="22" width="60" height="16" fill="#FFFFFF" />
    <rect x="18" width="16" height="60" fill="#FFFFFF" />
    <rect y="26" width="60" height="8" fill="#002868" />
    <rect x="22" width="8" height="60" fill="#002868" />
  </ClipFlag>
);

const FlagNZL = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#012169" />
    <rect y="13" width="30" height="4" fill="#FFFFFF" />
    <rect x="13" width="4" height="30" fill="#FFFFFF" />
    <rect y="14" width="30" height="2" fill="#CE1124" />
    <rect x="14" width="2" height="30" fill="#CE1124" />
    <circle cx="44" cy="20" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.6" />
    <circle cx="50" cy="32" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.6" />
    <circle cx="42" cy="40" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.6" />
    <circle cx="48" cy="48" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.6" />
  </ClipFlag>
);

const FlagPAN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="30" height="30" fill="#FFFFFF" />
    <rect x="30" width="30" height="30" fill="#DA121A" />
    <rect y="30" width="30" height="30" fill="#005AA7" />
    <rect x="30" y="30" width="30" height="30" fill="#FFFFFF" />
    <polygon
      points="15,8 17,13 22,13 18,16 20,21 15,18 10,21 12,16 8,13 13,13"
      fill="#005AA7"
    />
    <polygon
      points="45,38 47,43 52,43 48,46 50,51 45,48 40,51 42,46 38,43 43,43"
      fill="#DA121A"
    />
  </ClipFlag>
);

const FlagPAR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#D52B1E" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#0038A8" />
    <circle cx="30" cy="30" r="4" fill="none" stroke="#0038A8" strokeWidth="0.8" />
  </ClipFlag>
);

const FlagPOR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="24" height="60" fill="#006600" />
    <rect x="24" width="36" height="60" fill="#FF0000" />
    <circle cx="24" cy="30" r="7" fill="#FFDF00" stroke="#fff" strokeWidth="1" />
  </ClipFlag>
);

const FlagQAT = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#8A1538" />
    <rect width="20" height="60" fill="#FFFFFF" />
    <polygon
      points="20,0 16,5 20,10 16,15 20,20 16,25 20,30 16,35 20,40 16,45 20,50 16,55 20,60"
      fill="#8A1538"
    />
  </ClipFlag>
);

const FlagRSA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="30" fill="#E03C31" />
    <rect y="30" width="60" height="30" fill="#001489" />
    <polygon points="0,3 29,24 60,24 60,36 29,36 0,57" fill="#FFFFFF" />
    <polygon points="0,9 27,27 60,27 60,33 27,33 0,51" fill="#007A4D" />
    <polygon points="0,13 23,30 0,47" fill="#FFB81C" />
    <polygon points="0,18 16,30 0,42" fill="#000000" />
  </ClipFlag>
);

const FlagSCO = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#005EB8" />
    <polygon points="0,0 8,0 60,52 60,60 52,60 0,8" fill="#FFFFFF" />
    <polygon points="52,0 60,0 60,8 8,60 0,60 0,52" fill="#FFFFFF" />
  </ClipFlag>
);

const FlagSEN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="20" height="60" fill="#00853F" />
    <rect x="20" width="20" height="60" fill="#FDEF42" />
    <rect x="40" width="20" height="60" fill="#E31B23" />
    <polygon
      points="30,22 32,28 38,28 33,32 35,38 30,34 25,38 27,32 22,28 28,28"
      fill="#00853F"
    />
  </ClipFlag>
);

const FlagSUI = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FF0000" />
    <rect x="26" y="14" width="8" height="32" fill="#FFFFFF" />
    <rect x="14" y="26" width="32" height="8" fill="#FFFFFF" />
  </ClipFlag>
);

const FlagSWE = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#006AA7" />
    <rect y="22" width="60" height="16" fill="#FECC00" />
    <rect x="18" width="16" height="60" fill="#FECC00" />
  </ClipFlag>
);

const FlagTUN = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#E70013" />
    <circle cx="30" cy="30" r="14" fill="#FFFFFF" />
    <circle cx="32" cy="30" r="9" fill="#E70013" />
    <circle cx="34" cy="30" r="7" fill="#FFFFFF" />
    <polygon
      points="34,30 30,32 32,28 29,25 33,25 34,21 35,25 39,25 36,28 38,32"
      fill="#E70013"
    />
  </ClipFlag>
);

const FlagTUR = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#E30A17" />
    <circle cx="24" cy="30" r="10" fill="#FFFFFF" />
    <circle cx="27" cy="30" r="8" fill="#E30A17" />
    <polygon
      points="40,30 35,32 37,28 34,25 38,25 40,21 42,25 46,25 43,28 45,32"
      fill="#FFFFFF"
    />
  </ClipFlag>
);

const FlagUAE = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="15" height="60" fill="#FF0000" />
    <rect x="15" width="45" height="20" fill="#00732F" />
    <rect x="15" y="20" width="45" height="20" fill="#FFFFFF" />
    <rect x="15" y="40" width="45" height="20" fill="#000000" />
  </ClipFlag>
);

const FlagURU = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FFFFFF" />
    <rect x="22" y="6" width="38" height="4" fill="#0038A8" />
    <rect x="22" y="16" width="38" height="4" fill="#0038A8" />
    <rect y="26" width="60" height="4" fill="#0038A8" />
    <rect y="36" width="60" height="4" fill="#0038A8" />
    <rect y="46" width="60" height="4" fill="#0038A8" />
    <rect y="56" width="60" height="4" fill="#0038A8" />
    <circle cx="11" cy="14" r="6" fill="#FCD116" stroke="#0038A8" strokeWidth="0.4" />
  </ClipFlag>
);

const FlagUSA = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#FFFFFF" />
    <rect y="0" width="60" height="5" fill="#B22234" />
    <rect y="10" width="60" height="5" fill="#B22234" />
    <rect y="20" width="60" height="5" fill="#B22234" />
    <rect y="30" width="60" height="5" fill="#B22234" />
    <rect y="40" width="60" height="5" fill="#B22234" />
    <rect y="50" width="60" height="5" fill="#B22234" />
    <rect width="26" height="30" fill="#3C3B6E" />
  </ClipFlag>
);

const FlagUZB = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="20" fill="#0099B5" />
    <rect y="20" width="60" height="20" fill="#FFFFFF" />
    <rect y="40" width="60" height="20" fill="#1EB53A" />
    <rect y="19.5" width="60" height="1" fill="#CE1126" />
    <rect y="40" width="60" height="1" fill="#CE1126" />
  </ClipFlag>
);

const FlagFallback = ({ id }: FlagSvgProps) => (
  <ClipFlag id={id}>
    <rect width="60" height="60" fill="#D6D6D0" />
    <text
      x="30"
      y="38"
      textAnchor="middle"
      fontSize="22"
      fontWeight="700"
      fill="#8B8B85"
      fontFamily="system-ui, sans-serif"
    >
      ?
    </text>
  </ClipFlag>
);

const FLAG_COMPONENTS: Record<string, ComponentType<FlagSvgProps>> = {
  ALG: FlagALG,
  ARG: FlagARG,
  AUS: FlagAUS,
  AUT: FlagAUT,
  BEL: FlagBEL,
  BIH: FlagBIH,
  BRA: FlagBRA,
  CAN: FlagCAN,
  CIV: FlagCIV,
  COD: FlagCOD,
  COL: FlagCOL,
  CPV: FlagCPV,
  CRO: FlagCRO,
  CUW: FlagCUW,
  CZE: FlagCZE,
  ECU: FlagECU,
  EGY: FlagEGY,
  ENG: FlagENG,
  ESP: FlagESP,
  FRA: FlagFRA,
  GER: FlagGER,
  GHA: FlagGHA,
  HAI: FlagHAI,
  IRN: FlagIRN,
  IRQ: FlagIRQ,
  JOR: FlagJOR,
  JPN: FlagJPN,
  KOR: FlagKOR,
  KSA: FlagKSA,
  MAR: FlagMAR,
  MEX: FlagMEX,
  NED: FlagNED,
  NOR: FlagNOR,
  NZL: FlagNZL,
  PAN: FlagPAN,
  PAR: FlagPAR,
  POR: FlagPOR,
  QAT: FlagQAT,
  RSA: FlagRSA,
  SCO: FlagSCO,
  SEN: FlagSEN,
  SUI: FlagSUI,
  SWE: FlagSWE,
  TUN: FlagTUN,
  TUR: FlagTUR,
  UAE: FlagUAE,
  URU: FlagURU,
  USA: FlagUSA,
  UZB: FlagUZB,
};

export function Flag({
  code,
  instanceKey,
}: {
  code: string | null | undefined;
  instanceKey: string;
}): ReactElement {
  const C = (code && FLAG_COMPONENTS[code]) || FlagFallback;
  const id = `flag-${(code ?? "x").toLowerCase()}-${instanceKey}`;
  return <C id={id} />;
}

// Spanish names — keyed by the API's 3-letter team code. Covers every team in
// the Mundial 2026 qualified bracket plus UAE for the sandbox endpoint.
export const TEAM_NAMES_ES: Record<string, string> = {
  ALG: "Argelia",
  ARG: "Argentina",
  AUS: "Australia",
  AUT: "Austria",
  BEL: "Bélgica",
  BIH: "Bosnia y Herz.",
  BRA: "Brasil",
  CAN: "Canadá",
  CIV: "Costa de Marfil",
  COD: "RD del Congo",
  COL: "Colombia",
  CPV: "Cabo Verde",
  CRO: "Croacia",
  CUW: "Curazao",
  CZE: "Chequia",
  ECU: "Ecuador",
  EGY: "Egipto",
  ENG: "Inglaterra",
  ESP: "España",
  FRA: "Francia",
  GER: "Alemania",
  GHA: "Ghana",
  HAI: "Haití",
  IRN: "Irán",
  IRQ: "Irak",
  JOR: "Jordania",
  JPN: "Japón",
  KOR: "Corea del Sur",
  KSA: "Arabia Saudita",
  MAR: "Marruecos",
  MEX: "México",
  NED: "Países Bajos",
  NOR: "Noruega",
  NZL: "Nueva Zelanda",
  PAN: "Panamá",
  PAR: "Paraguay",
  POR: "Portugal",
  QAT: "Catar",
  RSA: "Sudáfrica",
  SCO: "Escocia",
  SEN: "Senegal",
  SUI: "Suiza",
  SWE: "Suecia",
  TUN: "Túnez",
  TUR: "Turquía",
  UAE: "Emiratos Árabes",
  URU: "Uruguay",
  USA: "Estados Unidos",
  UZB: "Uzbekistán",
};

export function teamLabel(code: string | null | undefined, fallback: string): string {
  if (code && TEAM_NAMES_ES[code]) return TEAM_NAMES_ES[code];
  return fallback;
}

// Short Spanish abbreviations — used where the full name doesn't fit (e.g.
// compact buttons). Falls back to the FIFA code or the supplied fallback.
export const TEAM_CODES_ES: Record<string, string> = {
  ALG: "AGL",
  ARG: "ARG",
  AUS: "AUS",
  AUT: "AUT",
  BEL: "BEL",
  BIH: "BOS",
  BRA: "BRA",
  CAN: "CAN",
  CIV: "CMA",
  COD: "RDC",
  COL: "COL",
  CPV: "CVE",
  CRO: "CRO",
  CUW: "CUR",
  CZE: "CHQ",
  ECU: "ECU",
  EGY: "EGI",
  ENG: "ING",
  ESP: "ESP",
  FRA: "FRA",
  GER: "ALE",
  GHA: "GHA",
  HAI: "HAI",
  IRN: "IRN",
  IRQ: "IRK",
  JOR: "JOR",
  JPN: "JPN",
  KOR: "COR",
  KSA: "ARS",
  MAR: "MAR",
  MEX: "MEX",
  NED: "PBJ",
  NOR: "NOR",
  NZL: "NZL",
  PAN: "PAN",
  PAR: "PAR",
  POR: "POR",
  QAT: "CAT",
  RSA: "SUD",
  SCO: "ESC",
  SEN: "SEN",
  SUI: "SUI",
  SWE: "SUE",
  TUN: "TUN",
  TUR: "TUR",
  UAE: "EAU",
  URU: "URU",
  USA: "USA",
  UZB: "UZB",
};

export function teamCode(code: string | null | undefined, fallback: string): string {
  if (code && TEAM_CODES_ES[code]) return TEAM_CODES_ES[code];
  return code ?? fallback;
}
