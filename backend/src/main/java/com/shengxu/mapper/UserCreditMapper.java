package com.shengxu.mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper; import com.shengxu.entity.UserCredit; import org.apache.ibatis.annotations.*;
@Mapper public interface UserCreditMapper extends BaseMapper<UserCredit> {
 @Update("UPDATE user_credit SET balance=balance-#{amount}, version=version+1 WHERE user_id=#{userId} AND balance>=#{amount}") int deduct(@Param("userId") Long userId,@Param("amount") int amount);
 @Update("UPDATE user_credit SET balance=balance+#{amount}, version=version+1 WHERE user_id=#{userId}") int refund(@Param("userId") Long userId,@Param("amount") int amount);
}

