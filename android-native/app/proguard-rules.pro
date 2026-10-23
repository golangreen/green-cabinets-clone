# kotlinx.serialization keeps its generated serializers
-keepattributes *Annotation*, InnerClasses
-keepclassmembers class com.greencabinetsny.app.** { *** Companion; }
-keepclasseswithmembers class com.greencabinetsny.app.** { kotlinx.serialization.KSerializer serializer(...); }
