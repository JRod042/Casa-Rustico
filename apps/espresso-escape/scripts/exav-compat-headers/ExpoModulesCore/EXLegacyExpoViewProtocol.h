#import <Foundation/Foundation.h>
#import <ExpoModulesCore/EXModuleRegistry.h>

@protocol EXLegacyExpoViewProtocol
@property (nonatomic, strong, nonnull) EXModuleRegistry *moduleRegistry;
- (instancetype)initWithModuleRegistry:(EXModuleRegistry *)moduleRegistry;
@end
