# Äventyr ute 0.5.1

Ett Androidspel på svenska och engelska för utomhusuppdrag med familjen eller en kompis.

- Välj **Svenska** eller **English** på startsidan. Ditt språkval sparas på enheten.
- 28 färdiga uppdrag, med plats, tid och vad ni behöver ta med.
- **Överraska oss** föreslår ett uppdrag som passar tiden ni har.
- I **Göteborgspasset** låser tre olika områdesstämplar upp en egen Göteborgstur.
- Tre olika avklarade uppdrag låser upp den sista skattjakten.
- Under **För föräldrar** kan ni lägga till egna uppdrag.
- Uppdrag och framsteg sparas på enheten. Spelet behöver inget konto, ingen uppkoppling för själva spelet.
- Den här versionen innehåller inga skärmtidsinställningar.

## Installera testversionen

Öppna [APK-filen](downloads/AventyrUte-0.5.1-debug.apk) på en Android-enhet med Android 8.0 eller senare. Android kan be dig tillåta installationer från appen du öppnade filen med. APK-filen är avsedd för testning.

## Bygg från källkod

Öppna den här mappen i Android Studio. Projektet använder JDK 17, Gradle 8.9 och Android SDK 35. Välj **Run** för en enhet eller emulator. Med Gradle 8.9 installerat går det även att köra:

```sh
gradle :app:assembleDebug
```

APK-filen hamnar i `app/build/outputs/apk/debug/`. Arbetsflödet **Android APK** bygger också en testfil i GitHub Actions när projektets innehåll ligger i repots rot.

## Familjeäventyr och minnesbok

Sju äventyr för barn 4–8 år och deras vuxna har flera kapitel och förberedelser för föräldern. Varje uppdrag har ett eget album för fotografier och anteckningar. Välj bilder med Androids bildväljare och dela en bild med Androids delningsmeny. Bilder sparas i appen på enheten och försvinner om appdata raderas eller appen avinstalleras. Delade kopior hanteras av mottagarappen.

## Uppdateringar

Vid start kontrollerar appen stabila versionstaggar i GitHub-repot. En ny version kan hämtas efter godkännande med synligt förlopp. Appen verifierar GitHubs filhash, paketnamn, högre versionskod och samma signatur före Androids installationsdialog. Nästa APK måste vara signerad med samma nyckel och finnas i `downloads/AventyrUte-X.Y.Z-debug.apk` under motsvarande `vX.Y.Z`-tagg. Internet och tillstånd att begära paketinstallation används för uppdateringar.

Albumet har knappen **Ta en bild / Take a Photo** som öppnar telefonens kamera och lägger den färdiga bilden i uppdragets album. **Lägg till bilder** väljer befintliga bilder. Om fotograferingen avbryts läggs ingen bild till.
