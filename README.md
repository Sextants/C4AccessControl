<h1>C4AccessControl</h1>

<h2>模块介绍</h2>

C4AccessControl是基于RBAC（基于角色权限控制）模型进行设计的权限控制框架（模块），需要配置C4WebService模块进行使用（已内置ACL解析和控制逻辑）。
其中主要概念有：

* 资源矩阵

  * 用于描述对资源可以进行的操作，包含create、read、update、delete四种操作，对应RESTFul API的POST、GET、PUT/PATCH、DELETE的METHOD；
  * 包含每种操作可以包含的用户关系描述，“own”和“any”，对应为当前用户关联和所有用户关联；
  * 支持对静态资源的配置
  
* 权限矩阵

  * 权限矩阵是与角色关联的对资源的权限设置

* 角色

  * 角色是与权限关联的用于权限管理的逻辑概念，即权限只有角色直接关联；
  * 角色是赋予用户的不同权限的逻辑组，即用户只与角色关联；

* 用户

  * 用户是最终执行权限判定的载体，但其不与权限直接关联，而是通过关联角色来赋予权限

<h2>使用</h2>

* 用ACL注解对方法进行标记；
* 注解项包含：

<code>

    /**
    * 资源矩阵配置信息
    */
    export interface ACResourceMatrix {
        /**
        * 最终会设置为path
        * TODO: 该处设计不合理，不应该设置为path，应该为资源名或ID
        * 增加一个对象来存储包含路径的向量
        */
        resource: string;
        /**
        * 显示名称(省略将为resource)
        */
        desc?: string;

        /**
        * 分组信息（默认值是空字符串）
        */
        group ?: string;

        /**
        * TODO: 这个desc是用于构建UI时给用户展示使用，
        * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
        */
        groupDesc?: string;

        /**
        * 操作(省略将为动作默认方法，如GET对应read)
        * TODO: 这里的desc是对action的描述，用于构建UI时给用户展示使用
        * 需要与Java端的实现沟通，并在档案（账户/权限）服务中增加该列的记录
        */
        action?: {
            create ?: actionOp;
            read   ?: actionOp;
            update ?: actionOp;
            delete ?: actionOp;
            createDesc ?: string;
            readDesc   ?: string;
            updateDesc ?: string;
            deleteDesc ?: string;
        };

        // 查询条件上表示用户标识的参数名
        paramUser  ?: string;

        // body体上表示用户表示的属性名
        bodyUser   ?: string;

        // 后置过滤配置
        /**
        * TODO: 后置过滤的配置
        */
        filters    ?: any;

        // 是否是静态资源的ACL
        staticRes  ?: boolean;

        // 静态资源ACL的path匹配正则
        staticPathReg ?: RegExp;
    };

</code>

<h3>类s</h3>

* C4AccessControl

  * 说明：C4AccessControl对象，提供资源矩阵上传、权限矩阵下载、用户权限验证功能
  * 路径：./src/C4AccessControl.ts
  * 成员变量：

    * m_bInit，是否初始化
    * m_ACLCache，权限的Cache
    * m_ACLCommunicator，通讯对象，用于同步资源、权限矩阵等
    * m_bDisable，功能是否开启
    * m_Logger，日志对象
    * m_ResourcesMatrix，资源矩阵
    * m_StaticResourcesMatrix，静态资源矩阵
    * m_RolesInfo，权限矩阵

  * 成员方法：

    * init

    <code>
    
        /**
        * 初始化
        * @param config C4AccessControlConfig
        */
        async init(config: C4AccessControlConfig)
    
    </code>

    <hr>

    * isEnabled

    <code>
    
        /**
        * 获取启用状态
        */
        isEnabled()
    
    </code>

    <hr>

    * isInit

    <code>
    
        /**
        * 获取初始化状态
        */
        isInit()
    
    </code>

    <hr>

    * addAccCtrlTarget

    <code>
    
        /**
        * 设置权限矩阵
        * @param accCfg ACResourceMatrix
        */
        addAccCtrlTarget(accCfg : ACResourceMatrix)
    
    </code>

    <hr>

    * getUserRoles

    <code>
    
        /**
        * 获取权限组
        * @param userID 用户ID
        */
        private async getUserRoles(userID : string)
    
    </code>

    <hr>

    * getRolePossession

    <code>
    
        /**
        * 获取权限组动作属性
        * @param roleName 角色名
        * @param resource 资源名
        * @param action 动作
        */
        private getRolePossession(roleName: string, resource: string, action: string)
    
    </code>

    <hr>

    * getResourceConfig

    <code>
    
        /**
        * 根据资源名获取资源矩阵
        * @param resource 
        */
        getResourceConfig(resource : string)
    
    </code>

    <hr>

    * getStaticResourceConfigs

    <code>
    
        /**
        * 获取静态资源的资源矩阵
        */
        getStaticResourceConfigs()
    
    </code>

    <hr>

    * AccCtrlAuth

    <code>
    
        /**
        * 判断权限
        * @param resource 权限接口资源名
        * @param inObj 入参对象
        */
        async AccCtrlAuth(resource: string, user: string, action: string | undefined, paramUser: string | undefined): Promise<{
            role : string;
            pass : boolean;
            user?: string;
        }> 
    
    </code>

    <hr>

    * updateAclMatrix

    <code>
    
        /**
        * 上传权限矩阵
        */
        async updateAclMatrix()
    
    </code>

    <hr>

    * launch

    <code>
    
        /**
        * 启动
        */
        async launch()
    
    </code>

    <hr>

    * reset

    <code>
    
        /**
        * 重置
        */
        async reset()
    
    </code>

  <hr>

* ACLCache

  * 说明：ACL的Cache接口对象
  * 路径：./src/C4AccessControlTypes/C4AccessControlConfig.ts
  * 成员变量：无
  * 成员方法：

    * init，初始化
    * release，释放
    * getCache，获取缓存
    * setCache，设置缓存

  <hr>

* ACLCommunicator

  * 说明：ACL的通讯接口对象
  * 路径：./src/C4AccessControlTypes/C4AccessControlConfig.ts
  * 成员变量：无
  * 成员方法：

    * init，初始化
    * release，释放
    * upload，上传
    * sync，同步权限矩阵
    * syncUserRoles，同步用户的角色

  <hr>

* ACLDefaultCache

  * 说明：测试用的Cache，在内存中存储
  * 路径：./src/C4AccessControlUtils/ACLDefaultCache.ts
  * 成员变量：

    * m_ACLCached，cache对象

  * 成员方法：同ACLCache

  <hr>

* ACLRedisCache

  * 说明：Redis Cache，在Redis中存储
  * 路径：./src/C4AccessControlUtils/ACLRedisCache.ts
  * 成员变量：

    * m_RedisClient，Redis客户端

  * 成员方法：同ACLCache

  <hr>

* ACLDemoCommunicator

  * 说明：用于提交和同步资源矩阵、权限矩阵的Communicator的Demo
  * 路径：./src/C4AccessControlUtils/ACLDemoCommunicator.ts
  * 成员变量：

    * m_Token，token
    * m_ServerHost，服务的地址

  * 成员方法：同ACLCommunicator

  <hr>

