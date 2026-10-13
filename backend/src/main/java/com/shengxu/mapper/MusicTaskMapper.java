package com.shengxu.mapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper; import com.shengxu.entity.MusicTask; import org.apache.ibatis.annotations.*;
@Mapper public interface MusicTaskMapper extends BaseMapper<MusicTask> {
 @Update("UPDATE music_task SET submit_stage='SUBMITTING', status='PROCESSING' WHERE id=#{id} AND submit_stage='CREATED'") int claimSubmit(Long id);
}

