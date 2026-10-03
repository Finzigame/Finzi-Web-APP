import React, { useEffect, useRef } from "react";
import { useGame } from "../api/context/GameContext";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    Image,
    Animated,
    Easing,
    StatusBar,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { Fonts } from "../Utils/Fonts";

const { width, height } = Dimensions.get("window");

// ── Branch decorations (same as CongratulationsScreen) ──────────────────────

const BranchTopRight = () => (
    <Svg width={138} height={122} viewBox="0 0 138 122"
        style={{ position: "absolute", right: -10, top: 60 }}>
        <Path
            d="M3.62046 34.5027C3.64922 35.6343 4.33263 36.9849 5.16572 37.7605C9.46467 41.7593 20.4903 40.2934 26.0942 40.434C29.9899 40.5314 33.8242 41.2449 37.5005 42.5807C36.2683 42.7557 35.0417 42.9444 33.8298 43.2505C29.7496 44.2814 21.9233 47.2174 21.8881 52.2619C21.8754 54.1217 22.9388 55.5667 24.7356 56.1187C28.2358 57.1937 33.7165 53.7444 36.6471 51.9811C39.8199 50.0716 42.9252 48.0066 45.9906 45.9323C51.6575 48.4249 57.2278 51.1426 62.7309 53.991C62.813 54.1134 62.4934 54.0979 62.4414 54.0954C57.0202 53.8527 47.8788 55.0233 43.7695 58.7933C39.8053 62.4293 40.6925 68.1022 46.736 68.0835C53.0294 68.0642 62.8818 62.6417 69.1296 60.4973C69.6159 60.3299 71.8003 59.5584 72.1216 59.5699C72.3895 59.5791 73.7289 60.3921 74.0799 60.6011C77.4346 62.6088 81.0242 65.1228 84.166 67.4364C85.7532 68.6044 87.3016 69.854 88.8241 71.1023C83.7582 70.2835 78.2358 69.8486 73.1459 70.5357C68.8712 71.113 61.1235 73.2325 62.2937 79.0189C63.7763 86.3505 75.8677 82.8916 80.5397 81.4603C84.9632 80.1047 90.5184 77.6248 94.9904 76.9996C95.2486 76.9637 95.5303 76.8641 95.7549 77.0481C99.5369 80.3646 103.077 83.9321 106.719 87.3924C106.612 87.6301 106.579 87.5014 106.465 87.4946C105.723 87.4539 104.834 87.1949 104.064 87.1129C99.5555 86.634 91.0674 86.6592 87.7565 90.1559C84.7901 93.2884 85.5453 97.3537 89.7327 98.8447C93.6675 100.246 100.297 98.2052 104.13 96.8694C106.91 95.9014 109.618 94.7336 112.37 93.6933C112.566 93.7306 112.718 93.8881 112.865 94.0099C115.775 96.4342 118.38 100.068 121.228 102.59C121.83 103.123 122.16 103.434 122.931 102.981C123.898 102.412 124.759 101.048 123.945 100.044C121.915 97.5408 118.907 94.8291 116.593 92.4762C115.747 91.615 114.817 90.8008 114.02 89.9179C113.69 82.6106 113.873 74.7923 111.58 67.7621C110.571 64.6677 108.222 59.407 104.375 59.4196C98.458 59.4389 100.405 68.0486 101.425 71.5532C102.354 74.7392 103.819 78.1423 105.364 81.0751C105.442 81.2224 105.633 81.2034 105.402 81.4075C105.279 81.1984 105.14 80.992 104.966 80.819C101.82 77.6775 98.4377 74.7552 95.1048 71.8228C93.0242 63.7935 91.3819 50.5188 84.7627 44.8242C80.1956 40.8954 75.0592 43.1557 76.3246 49.3849C77.3423 54.3942 81.3855 59.2714 84.4477 63.2308C84.541 63.351 84.7125 63.431 84.6142 63.6265C84.0212 63.2053 83.4748 62.7045 82.8805 62.285C79.1818 59.6748 75.2118 57.4355 71.4044 55.0168C67.063 47.4703 64.6105 34.6519 56.9553 29.6799C53.8933 27.6911 50.133 28.5416 49.3558 32.3865C48.4912 36.6663 52.5041 41.3469 55.0644 44.414L59.188 48.7099C57.4705 47.8524 55.7617 46.9626 54.0272 46.1377C52.6046 45.4606 50.6357 44.8066 49.3476 44.0373C48.3736 43.4565 46.5919 40.72 45.8839 39.6581C42.9082 35.1934 39.2106 26.2551 34.5431 23.8296C32.9169 22.9848 30.686 22.8715 29.3645 24.2979C26.1929 27.7207 30.0982 32.4795 32.3903 35.2201L35.54 38.652C29.1585 35.8136 22.9643 32.1889 16.188 30.3689C12.2912 29.3224 3.45718 28.2776 3.61662 34.5024L3.62046 34.5027Z"
            fill="#0A4148" stroke="#073036" strokeMiterlimit={10}
        />
    </Svg>
);

const BranchBottomRight = () => (
    <Svg width={138} height={122} viewBox="0 0 138 122"
        style={{ position: "absolute", right: -10, top: height * 0.62 }}>
        <Path
            d="M3.62046 34.5027C3.64922 35.6343 4.33263 36.9849 5.16572 37.7605C9.46467 41.7593 20.4903 40.2934 26.0942 40.434C29.9899 40.5314 33.8242 41.2449 37.5005 42.5807C36.2683 42.7557 35.0417 42.9444 33.8298 43.2505C29.7496 44.2814 21.9233 47.2174 21.8881 52.2619C21.8754 54.1217 22.9388 55.5667 24.7356 56.1187C28.2358 57.1937 33.7165 53.7444 36.6471 51.9811C39.8199 50.0716 42.9252 48.0066 45.9906 45.9323C51.6575 48.4249 57.2278 51.1426 62.7309 53.991C62.813 54.1134 62.4934 54.0979 62.4414 54.0954C57.0202 53.8527 47.8788 55.0233 43.7695 58.7933C39.8053 62.4293 40.6925 68.1022 46.736 68.0835C53.0294 68.0642 62.8818 62.6417 69.1296 60.4973C69.6159 60.3299 71.8003 59.5584 72.1216 59.5699C72.3895 59.5791 73.7289 60.3921 74.0799 60.6011C77.4346 62.6088 81.0242 65.1228 84.166 67.4364C85.7532 68.6044 87.3016 69.854 88.8241 71.1023C83.7582 70.2835 78.2358 69.8486 73.1459 70.5357C68.8712 71.113 61.1235 73.2325 62.2937 79.0189C63.7763 86.3505 75.8677 82.8916 80.5397 81.4603C84.9632 80.1047 90.5184 77.6248 94.9904 76.9996C95.2486 76.9637 95.5303 76.8641 95.7549 77.0481C99.5369 80.3646 103.077 83.9321 106.719 87.3924C106.612 87.6301 106.579 87.5014 106.465 87.4946C105.723 87.4539 104.834 87.1949 104.064 87.1129C99.5555 86.634 91.0674 86.6592 87.7565 90.1559C84.7901 93.2884 85.5453 97.3537 89.7327 98.8447C93.6675 100.246 100.297 98.2052 104.13 96.8694C106.91 95.9014 109.618 94.7336 112.37 93.6933C112.566 93.7306 112.718 93.8881 112.865 94.0099C115.775 96.4342 118.38 100.068 121.228 102.59C121.83 103.123 122.16 103.434 122.931 102.981C123.898 102.412 124.759 101.048 123.945 100.044C121.915 97.5408 118.907 94.8291 116.593 92.4762C115.747 91.615 114.817 90.8008 114.02 89.9179C113.69 82.6106 113.873 74.7923 111.58 67.7621C110.571 64.6677 108.222 59.407 104.375 59.4196C98.458 59.4389 100.405 68.0486 101.425 71.5532C102.354 74.7392 103.819 78.1423 105.364 81.0751C105.442 81.2224 105.633 81.2034 105.402 81.4075C105.279 81.1984 105.14 80.992 104.966 80.819C101.82 77.6775 98.4377 74.7552 95.1048 71.8228C93.0242 63.7935 91.3819 50.5188 84.7627 44.8242C80.1956 40.8954 75.0592 43.1557 76.3246 49.3849C77.3423 54.3942 81.3855 59.2714 84.4477 63.2308C84.541 63.351 84.7125 63.431 84.6142 63.6265C84.0212 63.2053 83.4748 62.7045 82.8805 62.285C79.1818 59.6748 75.2118 57.4355 71.4044 55.0168C67.063 47.4703 64.6105 34.6519 56.9553 29.6799C53.8933 27.6911 50.133 28.5416 49.3558 32.3865C48.4912 36.6663 52.5041 41.3469 55.0644 44.414L59.188 48.7099C57.4705 47.8524 55.7617 46.9626 54.0272 46.1377C52.6046 45.4606 50.6357 44.8066 49.3476 44.0373C48.3736 43.4565 46.5919 40.72 45.8839 39.6581C42.9082 35.1934 39.2106 26.2551 34.5431 23.8296C32.9169 22.9848 30.686 22.8715 29.3645 24.2979C26.1929 27.7207 30.0982 32.4795 32.3903 35.2201L35.54 38.652C29.1585 35.8136 22.9643 32.1889 16.188 30.3689C12.2912 29.3224 3.45718 28.2776 3.61662 34.5024L3.62046 34.5027Z"
            fill="#0A4148" stroke="#073036" strokeMiterlimit={10}
        />
    </Svg>
);

const BranchLeftUpper = () => (
    <Svg width={117} height={143} viewBox="0 0 117 143"
        style={{ position: "absolute", left: -51, top: height * 0.28 }}>
        <Path
            d="M111.614 28.0486C112.218 29.1886 112.266 30.7159 111.836 31.7062C109.612 36.8128 97.3349 38.1787 91.5916 39.7592C87.5988 40.8577 84.0155 42.557 80.9453 44.8385C82.3236 44.697 83.7039 44.5707 85.1347 44.5657C89.9521 44.5491 99.7301 45.4766 102.596 50.5163C103.653 52.3744 103.359 54.0938 101.801 55.108C98.768 57.0832 91.1389 55.0392 87.1051 54.0274C82.7376 52.9315 78.353 51.6627 74.0047 50.3743C69.5153 54.3251 65.2525 58.4762 61.1329 62.741C61.1163 62.8846 61.4396 62.787 61.4922 62.7711C66.9884 61.1352 77.1425 59.9581 83.5265 62.6753C89.6848 65.2959 91.9452 71.2014 85.6559 72.7355C79.1066 74.3332 65.8288 71.4376 58.1347 70.8968C57.5355 70.8542 54.8333 70.6433 54.5059 70.7374C54.2328 70.8154 53.2973 71.9732 53.0499 72.2726C50.6907 75.144 48.3715 78.5824 46.4052 81.7051C45.4114 83.2819 44.5036 84.9304 43.6221 86.571C48.4259 84.4499 53.9194 82.5956 59.593 81.9755C64.358 81.4549 73.5964 81.5855 75.6265 87.6775C78.1988 95.396 63.6962 95.041 58.0394 94.809C52.6832 94.5888 45.5206 93.5342 40.5237 94.0575C40.2353 94.0879 39.8867 94.0606 39.7566 94.3025C37.6877 98.5935 36.0112 103.074 34.1676 107.473C34.4131 107.683 34.375 107.546 34.4889 107.51C35.2372 107.278 36.0159 106.79 36.7696 106.511C41.1851 104.873 50.018 102.717 55.4192 105.366C60.2584 107.739 61.7542 112.002 58.2401 114.57C54.9379 116.983 46.9052 116.644 42.1738 116.292C38.7433 116.038 35.2744 115.565 31.832 115.23C31.6489 115.318 31.5793 115.515 31.4945 115.675C29.8318 118.849 29.1632 123.155 27.6192 126.411C27.2925 127.099 27.124 127.495 26.0694 127.239C24.7455 126.919 23.0859 125.775 23.3681 124.561C24.0729 121.534 25.6774 118.047 26.7611 115.098C27.1575 114.018 27.6671 112.964 27.9991 111.876C24.2428 104.478 19.6671 96.7001 18.1061 89.0748C17.4192 85.7185 16.9079 79.8501 20.9119 78.8742C27.0705 77.3731 29.8774 86.4902 30.7829 90.26C31.6058 93.6871 31.9922 97.4696 32.0319 100.802C32.0338 100.969 31.8244 100.999 32.1795 101.144C32.1901 100.903 32.2184 100.661 32.3019 100.443C33.8082 96.4908 35.6831 92.697 37.5009 88.9057C35.1585 80.3352 29.4184 66.6275 33.101 59.2274C35.6421 54.1218 42.2464 55.0643 44.426 61.6238C46.1786 66.8987 44.7139 72.8189 43.7533 77.5684C43.7239 77.7127 43.5906 77.8368 43.8023 78.0072C44.1821 77.4333 44.4689 76.7917 44.8511 76.2191C47.2296 72.6564 50.0981 69.3952 52.697 65.9962C52.9743 57.328 48.3319 43.8687 53.4961 36.9256C55.5618 34.1484 59.9457 34.0334 62.9099 37.6819C66.2089 41.7431 64.6654 47.4586 63.7258 51.1862L61.8514 56.5452C63.1547 55.2457 64.4309 53.9161 65.7702 52.6448C66.8685 51.6016 68.5472 50.4412 69.4539 49.3402C70.14 48.5087 70.4561 45.3122 70.596 44.0675C71.1831 38.8345 70.0109 28.9386 73.4996 25.3119C74.7152 24.0485 76.9694 23.3619 79.1425 24.45C84.3576 27.0608 82.9697 32.827 82.1257 36.1588L80.7783 40.4028C85.8162 35.9223 90.2183 30.7031 96.2376 27.1405C99.6992 25.0919 108.291 21.7763 111.617 28.0474L111.614 28.0486Z"
            fill="#13808C" stroke="#03616C" strokeMiterlimit={10}
        />
    </Svg>
);

const BranchLeftLower = () => (
    <Svg width={117} height={143} viewBox="0 0 117 143"
        style={{ position: "absolute", left: -51, top: height * 0.64 }}>
        <Path
            d="M111.614 28.0486C112.218 29.1886 112.266 30.7159 111.836 31.7062C109.612 36.8128 97.3349 38.1787 91.5916 39.7592C87.5988 40.8577 84.0155 42.557 80.9453 44.8385C82.3236 44.697 83.7039 44.5707 85.1347 44.5657C89.9521 44.5491 99.7301 45.4766 102.596 50.5163C103.653 52.3744 103.359 54.0938 101.801 55.108C98.768 57.0832 91.1389 55.0392 87.1051 54.0274C82.7376 52.9315 78.353 51.6627 74.0047 50.3743C69.5153 54.3251 65.2525 58.4762 61.1329 62.741C61.1163 62.8846 61.4396 62.787 61.4922 62.7711C66.9884 61.1352 77.1425 59.9581 83.5265 62.6753C89.6848 65.2959 91.9452 71.2014 85.6559 72.7355C79.1066 74.3332 65.8288 71.4376 58.1347 70.8968C57.5355 70.8542 54.8333 70.6433 54.5059 70.7374C54.2328 70.8154 53.2973 71.9732 53.0499 72.2726C50.6907 75.144 48.3715 78.5824 46.4052 81.7051C45.4114 83.2819 44.5036 84.9304 43.6221 86.571C48.4259 84.4499 53.9194 82.5956 59.593 81.9755C64.358 81.4549 73.5964 81.5855 75.6265 87.6775C78.1988 95.396 63.6962 95.041 58.0394 94.809C52.6832 94.5888 45.5206 93.5342 40.5237 94.0575C40.2353 94.0879 39.8867 94.0606 39.7566 94.3025C37.6877 98.5935 36.0112 103.074 34.1676 107.473C34.4131 107.683 34.375 107.546 34.4889 107.51C35.2372 107.278 36.0159 106.79 36.7696 106.511C41.1851 104.873 50.018 102.717 55.4192 105.366C60.2584 107.739 61.7542 112.002 58.2401 114.57C54.9379 116.983 46.9052 116.644 42.1738 116.292C38.7433 116.038 35.2744 115.565 31.832 115.23C31.6489 115.318 31.5793 115.515 31.4945 115.675C29.8318 118.849 29.1632 123.155 27.6192 126.411C27.2925 127.099 27.124 127.495 26.0694 127.239C24.7455 126.919 23.0859 125.775 23.3681 124.561C24.0729 121.534 25.6774 118.047 26.7611 115.098C27.1575 114.018 27.6671 112.964 27.9991 111.876C24.2428 104.478 19.6671 96.7001 18.1061 89.0748C17.4192 85.7185 16.9079 79.8501 20.9119 78.8742C27.0705 77.3731 29.8774 86.4902 30.7829 90.26C31.6058 93.6871 31.9922 97.4696 32.0319 100.802C32.0338 100.969 31.8244 100.999 32.1795 101.144C32.1901 100.903 32.2184 100.661 32.3019 100.443C33.8082 96.4908 35.6831 92.697 37.5009 88.9057C35.1585 80.3352 29.4184 66.6275 33.101 59.2274C35.6421 54.1218 42.2464 55.0643 44.426 61.6238C46.1786 66.8987 44.7139 72.8189 43.7533 77.5684C43.7239 77.7127 43.5906 77.8368 43.8023 78.0072C44.1821 77.4333 44.4689 76.7917 44.8511 76.2191C47.2296 72.6564 50.0981 69.3952 52.697 65.9962C52.9743 57.328 48.3319 43.8687 53.4961 36.9256C55.5618 34.1484 59.9457 34.0334 62.9099 37.6819C66.2089 41.7431 64.6654 47.4586 63.7258 51.1862L61.8514 56.5452C63.1547 55.2457 64.4309 53.9161 65.7702 52.6448C66.8685 51.6016 68.5472 50.4412 69.4539 49.3402C70.14 48.5087 70.4561 45.3122 70.596 44.0675C71.1831 38.8345 70.0109 28.9386 73.4996 25.3119C74.7152 24.0485 76.9694 23.3619 79.1425 24.45C84.3576 27.0608 82.9697 32.827 82.1257 36.1588L80.7783 40.4028C85.8162 35.9223 90.2183 30.7031 96.2376 27.1405C99.6992 25.0919 108.291 21.7763 111.617 28.0474L111.614 28.0486Z"
            fill="#13808C" stroke="#03616C" strokeMiterlimit={10}
        />
    </Svg>
);

const BranchRightMiddle = () => (
    <Svg width={149} height={152} viewBox="0 0 149 152"
        style={{ position: "absolute", right: -20, top: height * 0.32 }}>
        <Path
            d="M5.14886 39.8923C4.84357 41.2594 5.24661 42.9354 5.99898 43.9282C9.88254 49.0464 23.3572 48.0337 29.9404 48.5872C34.5169 48.9717 38.8361 50.0951 42.7819 51.9584C41.2727 52.0851 39.766 52.2287 38.2413 52.5149C33.1085 53.4789 22.9754 56.4844 21.4213 62.5672C20.8486 64.8099 21.6727 66.6258 23.6315 67.4149C27.4472 68.9515 34.9611 65.166 38.9545 63.2398C43.278 61.1537 47.5685 58.8754 51.8145 56.5832C57.767 59.9785 63.5377 63.6384 69.1897 67.4516C69.2501 67.605 68.8769 67.5643 68.8162 67.5578C62.4796 66.8934 51.3211 67.6792 45.3326 71.9454C39.5557 76.06 38.9037 82.9641 46.0543 83.3557C53.5005 83.7636 66.7744 77.8974 74.8039 75.7388C75.4291 75.5701 78.2428 74.7891 78.6193 74.825C78.9332 74.8545 80.273 75.927 80.6253 76.2031C83.9895 78.855 87.4796 82.1336 90.5003 85.1397C92.0266 86.6575 93.4826 88.271 94.9083 89.8812C89.1646 88.5464 82.7661 87.6433 76.5424 88.1234C71.3156 88.5269 61.5202 90.5528 61.1688 97.6133C60.7234 106.559 76.0557 103.215 82.0083 101.809C87.6446 100.476 94.9557 97.8654 100.43 97.4177C100.746 97.3921 101.109 97.2912 101.32 97.5286C104.797 101.789 107.912 106.335 111.181 110.758C110.982 111.038 110.982 110.88 110.85 110.864C109.985 110.764 109.011 110.391 108.126 110.239C102.939 109.353 92.896 108.801 87.9334 112.793C83.4871 116.368 83.161 121.324 87.6646 123.41C91.8965 125.369 100.347 123.362 105.278 122.013C108.855 121.036 112.407 119.813 115.972 118.746C116.193 118.805 116.325 119.005 116.463 119.162C119.176 122.286 121.167 126.848 123.777 130.086C124.329 130.77 124.626 131.168 125.673 130.674C126.987 130.054 128.414 128.468 127.753 127.201C126.104 124.042 123.36 120.564 121.33 117.568C120.588 116.471 119.732 115.425 119.055 114.305C120.856 105.468 123.417 96.0488 122.813 87.4111C122.548 83.6091 121.349 77.1021 116.797 76.8537C109.795 76.4715 109.515 86.991 109.671 91.2885C109.813 95.1954 110.525 99.4011 111.473 103.045C111.521 103.228 111.753 103.218 111.418 103.448C111.335 103.188 111.233 102.929 111.079 102.709C108.302 98.7034 105.179 94.9464 102.118 91.1806C102.065 81.3522 104.104 65.2263 97.9855 57.9033C93.764 52.8508 87.0137 55.2256 86.6421 62.8267C86.3434 68.9392 89.6611 75.0997 92.0944 80.0857C92.1685 80.2372 92.3473 80.3454 92.1726 80.5745C91.5978 80.0258 91.1019 79.3843 90.5251 78.8375C86.9349 75.4353 82.9127 72.462 79.1366 69.2833C76.2665 59.8825 77.2102 44.2513 69.6506 37.729C66.6268 35.12 61.9261 35.8884 59.8545 40.4733C57.5491 45.5768 60.89 51.4981 62.9974 55.3735L66.5845 60.8382C64.8111 59.6861 63.0577 58.4957 61.2544 57.3816C59.7754 56.4674 57.6437 55.5436 56.3515 54.5272C55.3742 53.7599 54.0882 50.3368 53.5696 49.0073C51.3902 43.4175 49.6985 32.3817 44.9075 29.1361C43.2383 28.0055 40.6347 27.7159 38.6447 29.3461C33.8688 33.2578 37.0591 39.266 38.9472 42.7291L41.6421 47.0848C34.9485 43.2235 28.7121 38.4266 21.2464 35.7668C16.9532 34.2374 6.82229 32.3716 5.1444 39.8917L5.14886 39.8923Z"
            fill="#13808C" stroke="#03616C" strokeMiterlimit={10}
        />
    </Svg>
);

const GlowDot: React.FC<{ style?: object }> = ({ style }) => (
    <Svg width={9} height={9} viewBox="0 0 9 9" style={[{ position: "absolute" }, style]}>
        <Circle cx={4.5} cy={4.5} r={4.5} fill="#FEE23B" opacity={0.85} />
    </Svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

function formatCountdown(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

interface IncorrectScreenProps {
    onNext: () => void;
    feedback: string;
    livesLeft: number;
    statusAfter: "active" | "finished" | "failed";
    onGoToLivesShop?: () => void;
}

const HeartsRow: React.FC<{ livesLeft: number; total?: number }> = ({ livesLeft, total = 3 }) => (
    <View style={styles.heartsRow}>
        {Array.from({ length: total }).map((_, i) => (
            <Text key={i} style={[styles.heartIcon, i >= livesLeft && styles.heartEmpty]}>
                {i < livesLeft ? "❤️" : "🖤"}
            </Text>
        ))}
    </View>
);

const IncorrectScreen: React.FC<IncorrectScreenProps> = ({
    onNext,
    feedback,
    livesLeft,
    statusAfter,
    onGoToLivesShop,
}) => {
    const { secondsUntilNextLife, maxLives } = useGame();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const charScaleAnim = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.spring(charScaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
        }).start();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const buttonText = statusAfter === "active" ? "Siguiente" : "Continuar";

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#006E77" barStyle="light-content" />

            {/* Same branch decorations as CongratulationsScreen */}
            <BranchTopRight />
            <BranchLeftUpper />
            <BranchLeftLower />
            <BranchBottomRight />
            <BranchRightMiddle />

            {/* Glow dots */}
            <GlowDot style={{ right: width * 0.13, top: height * 0.24 }} />
            <GlowDot style={{ left: width * 0.6, top: height * 0.1 }} />
            <GlowDot style={{ left: width * 0.07, top: height * 0.22 }} />
            <GlowDot style={{ left: width * 0.16, top: height * 0.43 }} />
            <GlowDot style={{ left: width * 0.22, top: height * 0.64 }} />
            <GlowDot style={{ left: width * 0.46, top: height * 0.67 }} />
            <GlowDot style={{ right: width * 0.2, top: height * 0.69 }} />

            {/* Personaje */}
            <Animated.View
                style={[styles.characterContainer, { transform: [{ scale: charScaleAnim }] }]}
            >
                <Image
                    source={require('../assets/icons/img_c32ae417.png')}
                    style={styles.characterImage}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Título */}
            <Animated.View
                style={[
                    styles.titleContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={styles.title}>¡Buen intento!</Text>
            </Animated.View>

            {/* Feedback card */}
            <Animated.View
                style={[
                    styles.feedbackCard,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={styles.feedbackLabel}>💡 Tip</Text>
                <Text style={styles.feedbackText}>
                    {feedback?.trim()?.length ? feedback : "Intenta de nuevo, vas bien."}
                </Text>

                {livesLeft >= 0 && (
                    <View style={styles.livesContainer}>
                        <Text style={styles.livesLabel}>Vidas restantes</Text>
                        <HeartsRow livesLeft={livesLeft} total={maxLives} />
                    </View>
                )}
            </Animated.View>

            {/* Panel sin vidas — solo cuando statusAfter === "failed" y lives === 0 */}
            {statusAfter === "failed" && livesLeft <= 0 && (
                <Animated.View
                    style={[
                        styles.noLivesPanel,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <Text style={styles.noLivesTitle}>💔 Sin vidas</Text>
                    {secondsUntilNextLife !== null && (
                        <Text style={styles.noLivesCountdown}>
                            Próxima vida en: {formatCountdown(secondsUntilNextLife)}
                        </Text>
                    )}
                    <TouchableOpacity style={styles.adRecoverBtn} activeOpacity={0.8}>
                        <Text style={styles.adRecoverText}>Ver anuncio — recuperar vida</Text>
                    </TouchableOpacity>
                    {onGoToLivesShop && (
                        <TouchableOpacity style={styles.shopBtn} onPress={onGoToLivesShop} activeOpacity={0.85}>
                            <Text style={styles.shopBtnText}>Comprar vidas  →  40 🌰</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            )}

            {/* Botón */}
            <Animated.View
                style={[
                    styles.nextButtonContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <TouchableOpacity onPress={onNext} activeOpacity={0.85} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>{buttonText}</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#006E77",
        alignItems: "center",
        justifyContent: "center",
    },

    characterContainer: {
        width: scale(210),
        height: verticalScale(265),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: verticalScale(10),
    },
    characterImage: {
        width: scale(210),
        height: verticalScale(265),
    },

    titleContainer: {
        alignItems: "center",
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(18),
    },
    title: {
        color: "#FFF",
        textAlign: "center",
        fontFamily: Fonts.One,
        fontSize: moderateScale(52),
        fontWeight: "400",
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
        includeFontPadding: false,
    },

    feedbackCard: {
        width: width - scale(48),
        backgroundColor: "rgba(0, 0, 0, 0.18)",
        borderRadius: scale(20),
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.12)",
        padding: scale(20),
        marginBottom: verticalScale(20),
    },
    feedbackLabel: {
        color: "#ECDF3D",
        fontFamily: Fonts.One,
        fontSize: moderateScale(20),
        marginBottom: verticalScale(8),
        includeFontPadding: false,
    },
    feedbackText: {
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(17),
        lineHeight: moderateScale(24),
    },
    livesContainer: {
        marginTop: verticalScale(14),
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.12)",
        paddingTop: verticalScale(14),
        alignItems: "center",
    },
    livesLabel: {
        color: "rgba(255,255,255,0.6)",
        fontFamily: Fonts.One,
        fontSize: moderateScale(13),
        marginBottom: verticalScale(8),
        includeFontPadding: false,
    },
    heartsRow: {
        flexDirection: "row",
        gap: scale(6),
    },
    heartIcon: {
        fontSize: moderateScale(24),
    },
    heartEmpty: {
        opacity: 0.35,
    },

    nextButtonContainer: {
        position: "absolute",
        bottom: height * 0.08,
        alignSelf: "center",
        width: width * 0.78,
    },
    nextButton: {
        width: "100%",
        height: verticalScale(58),
        borderRadius: scale(16),
        backgroundColor: "#FF8900",
        shadowColor: "#C05E00",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    nextButtonText: {
        color: "#FFF",
        textAlign: "center",
        fontFamily: Fonts.One,
        fontSize: moderateScale(20),
        fontWeight: "400",
        textShadowColor: "rgba(0, 0, 0, 0.25)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 3,
        includeFontPadding: false,
    },

    noLivesPanel: {
        position: "absolute",
        bottom: height * 0.18,
        width: width - scale(48),
        backgroundColor: "rgba(0,0,0,0.22)",
        borderRadius: scale(20),
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.12)",
        padding: scale(20),
        alignItems: "center",
        gap: scale(10),
    },
    noLivesTitle: {
        color: "#FFF",
        fontFamily: Fonts.One,
        fontSize: moderateScale(22),
    },
    noLivesCountdown: {
        color: "rgba(255,255,255,0.75)",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(15),
    },
    adRecoverBtn: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: scale(12),
        paddingVertical: verticalScale(12),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    adRecoverText: {
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(15),
    },
    shopBtn: {
        width: "100%",
        backgroundColor: "#0195A5",
        borderRadius: scale(12),
        paddingVertical: verticalScale(12),
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#02858D",
    },
    shopBtnText: {
        color: "#FFF",
        fontFamily: Fonts.Bold,
        fontSize: moderateScale(15),
    },
});

export default IncorrectScreen;
