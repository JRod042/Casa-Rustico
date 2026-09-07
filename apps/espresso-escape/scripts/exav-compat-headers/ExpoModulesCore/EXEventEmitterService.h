#import <Foundation/Foundation.h>
#import <ExpoModulesCore/EXEventEmitter.h>

@protocol EXEventEmitterService <NSObject>
- (void)sendEventWithName:(NSString *)eventName body:(id)body;
@end
