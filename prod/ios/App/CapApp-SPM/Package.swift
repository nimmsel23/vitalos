// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.6.0"),
        .package(name: "CapacitorFirebaseAuthentication", path: "../../../../node_modules/.pnpm/@capacitor-firebase+authentication@8.6.0_@capacitor+core@8.6.0_firebase@12.19.0/node_modules/@capacitor-firebase/authentication"),
        .package(name: "CapacitorLocalNotifications", path: "../../../../node_modules/.pnpm/@capacitor+local-notifications@8.3.1_@capacitor+core@8.6.0/node_modules/@capacitor/local-notifications"),
        .package(name: "CapgoCapacitorHealth", path: "../../../../node_modules/.pnpm/@capgo+capacitor-health@8.12.1_@capacitor+core@8.6.0/node_modules/@capgo/capacitor-health")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorFirebaseAuthentication", package: "CapacitorFirebaseAuthentication"),
                .product(name: "CapacitorLocalNotifications", package: "CapacitorLocalNotifications"),
                .product(name: "CapgoCapacitorHealth", package: "CapgoCapacitorHealth")
            ]
        )
    ]
)
