#!/bin/zsh
# Archives the Green Cabinets iPhone app and uploads it to App Store Connect,
# signed manually with "Green Cabinets AppStore" and authenticated by the ASC API key.
set -e
cd "${0:A:h}/.."
export PATH="$HOME/.bun/bin:$PATH"
export DEVELOPER_DIR=~/Downloads/Xcode.app/Contents/Developer
npm run build >/dev/null && npx cap sync ios >/dev/null
OUT=$(mktemp -d)
K=~/Downloads/store/asc-key.json
KID=$(node -pe 'require(process.argv[1]).keyId' $K)
ISS=$(node -pe 'require(process.argv[1]).issuerId' $K)
P8=$(node -pe 'require(process.argv[1]).p8Path.replace(/^~/,require("os").homedir())' $K)
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' \
  -archivePath $OUT/GC.xcarchive DEVELOPMENT_TEAM=S8JF9GV89U archive -quiet
xcodebuild -exportArchive -archivePath $OUT/GC.xcarchive -exportPath $OUT/upload -exportOptionsPlist ios/App/exportOptions.plist \
  -authenticationKeyPath "$P8" -authenticationKeyID "$KID" -authenticationKeyIssuerID "$ISS" 2>&1 | grep -E "error|EXPORT|Upload"
