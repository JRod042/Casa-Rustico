// Compat header — ExpoModulesCore 57 dropped EXEventEmitter.h; expo-av 16 EXAV still imports it.
#import <Foundation/Foundation.h>
#import <ExpoModulesCore/EXDefines.h>

#ifndef UMPromiseResolveBlock
typedef EXPromiseResolveBlock UMPromiseResolveBlock;
typedef EXPromiseRejectBlock UMPromiseRejectBlock;
#endif

@protocol EXEventEmitter <NSObject>
- (NSArray<NSString *> *)supportedEvents;
- (void)startObserving;
- (void)stopObserving;
@end
