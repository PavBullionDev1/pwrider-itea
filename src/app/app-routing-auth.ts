// 辅助函数：为路由添加认证守卫
export function addAuthGuard(route: any) {
  // 不需要认证的路由
  const publicRoutes = ['login', 'logout', 'terms', ''];
  
  if (publicRoutes.includes(route.path)) {
    return route;
  }
  
  return {
    ...route,
    canActivate: [AuthGuard]
  };
}