package com.thiscount.backend.util;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * כלי עזר לאבטחת נתיבים (Path Security).
 * מוודא שכל פעולת קובץ מתבצעת בתוך "ארגז חול" מוגדר מראש.
 */
public class PathSandbox {

    /**
     * הופך נתיב טקסטואלי לנתיב מוחלט ומנורמל (בלי .. או .).
     * זהו ה-Root של ה-Sandbox שלנו.
     */
    public static Path boxRoot(String rootDir) {
        return Paths.get(rootDir).toAbsolutePath().normalize();
    }

    /**
     * מחבר בין תיקיית השורש לשם הקובץ ומוודא שהתוצאה נשארת בתוך השורש.
     * @throws SecurityException אם זוהה ניסיון "לברוח" מהתיקייה.
     */
    public static Path resolveSafe(Path root, String fileName) {
        Path resolved = root.resolve(fileName).normalize();
        if (!resolved.startsWith(root)) {
            throw new SecurityException("SECURITY ALERT: Path Traversal attempt detected! Filename: " + fileName);
        }

        return resolved;
    }
}