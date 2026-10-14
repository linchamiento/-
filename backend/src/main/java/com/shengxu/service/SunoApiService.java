package com.shengxu.service;
import com.fasterxml.jackson.databind.*; import org.springframework.beans.factory.annotation.Value; import org.springframework.http.MediaType; import org.springframework.stereotype.Service; import org.springframework.web.client.RestClient;
import java.math.BigDecimal; import java.util.*;
@Service
public class SunoApiService {
 private final RestClient client; private final String key; private final String model;
 public SunoApiService(RestClient.Builder builder,@Value("${app.suno.base-url}") String base,@Value("${app.suno.api-key}") String key,@Value("${app.suno.model}") String model){this.client=builder.baseUrl(base).build();this.key=key;this.model=model;}
 public boolean configured(){return key!=null&&!key.isBlank();}
 public List<ProviderSong> create(String prompt,String style,String mood,String vocal,String language,String lyricsMode,String lyrics,String title,String negativeTags,String requestedModel,String sourceClipId,String sourceType,String sourceAudioUrl,String sourceTitle,Integer weirdness,Integer styleWeight,Integer duration,Integer variety,BigDecimal audioWeight,Boolean maxMode,String voiceId,String soundType,Integer soundBpm,String soundKey,Boolean soundLoop){
  Map<String,Object> body=new LinkedHashMap<>();body.put("model",requestedModel==null||requestedModel.isBlank()?model:requestedModel);body.put("wait_completion",false);boolean instrumental="INSTRUMENTAL".equals(vocal);body.put("instrumental",instrumental);if(Boolean.TRUE.equals(maxMode))body.put("max_mode",true);
  boolean customMode="CUSTOM".equalsIgnoreCase(sourceType);
  String styleDescription=customMode?style:String.join(", ",style,mood==null?"":mood,language==null?"":language,prompt,negativeTags==null?"":negativeTags);
  String path;if("SOUND".equalsIgnoreCase(soundType)){path="/api/music/sounds";body.clear();body.put("model",requestedModel==null||requestedModel.isBlank()?model:requestedModel);body.put("description",prompt);body.put("type",soundType);body.put("loop",Boolean.TRUE.equals(soundLoop));if(soundBpm!=null)body.put("bpm",soundBpm);if(soundKey!=null&&!soundKey.isBlank())body.put("key",soundKey);}
  else if(voiceId!=null&&!voiceId.isBlank()){path="/api/music/voice-profile/cover";body.put("voice_id",voiceId);body.put("lyrics","USER".equals(lyricsMode)&&!instrumental?lyrics:prompt);body.put("style_requirements",styleDescription);body.put("cover_requirements",styleDescription);body.put("model",requestedModel);body.put("max_mode",Boolean.TRUE.equals(maxMode));body.put("waitAudio",false);if(title!=null&&!title.isBlank())body.put("title",title);if(negativeTags!=null&&!negativeTags.isBlank())body.put("negative_tags",negativeTags);if(weirdness!=null)body.put("weirdness_constraint",weirdness/100.0);if(styleWeight!=null)body.put("style_weight",styleWeight/100.0);if(duration!=null)body.put("duration",duration);if(variety!=null)body.put("variety",variety);if(audioWeight!=null)body.put("audio_weight",audioWeight);}
  else if(sourceClipId!=null&&!sourceClipId.isBlank()){path="/api/music/generate-from-source";body.put("sourceClipId",sourceClipId);if(sourceAudioUrl!=null&&!sourceAudioUrl.isBlank())body.put("sourceAudioUrl",sourceAudioUrl);if(sourceTitle!=null&&!sourceTitle.isBlank())body.put("sourceTitle",sourceTitle);body.put("prompt","USER".equals(lyricsMode)&&!instrumental?lyrics:prompt);body.put("customMode","USER".equals(lyricsMode));body.put("style",styleDescription);body.put("instrumental",instrumental);if(title!=null&&!title.isBlank())body.put("title",title);if(negativeTags!=null&&!negativeTags.isBlank())body.put("negativeTags",negativeTags);body.put("waitAudio",false);body.put("lyricsMode",lyricsMode);if("MALE".equals(vocal)||"FEMALE".equals(vocal))body.put("vocalGender","MALE".equals(vocal)?"m":"f");if(weirdness!=null)body.put("weirdnessConstraint",weirdness/100.0);if(styleWeight!=null)body.put("styleWeight",styleWeight/100.0);if(duration!=null)body.put("duration",duration);if(variety!=null)body.put("variety",variety);if(audioWeight!=null)body.put("audio_weight",audioWeight);}
  else if("CUSTOM".equalsIgnoreCase(sourceType) || "USER".equals(lyricsMode)){path="/api/music/create/custom";body.put("lyrics",instrumental?"":lyrics);body.put("style_tags",styleDescription);body.put("instrumental",instrumental);body.put("wait_completion",false);if(title!=null&&!title.isBlank())body.put("song_title",title);if(negativeTags!=null&&!negativeTags.isBlank())body.put("negative_tags",negativeTags);if("MALE".equals(vocal)||"FEMALE".equals(vocal))body.put("vocal_gender","MALE".equals(vocal)?"m":"f");if(weirdness!=null)body.put("weirdness_constraint",weirdness/100.0);if(styleWeight!=null)body.put("style_weight",styleWeight/100.0);if(duration!=null)body.put("duration",duration);if(variety!=null)body.put("variety",variety);if(audioWeight!=null)body.put("audio_weight",audioWeight);if(Boolean.TRUE.equals(maxMode))body.put("max_mode",true);}
  else {path="/api/music/create";String voice=instrumental?"纯音乐":"MALE".equals(vocal)?"男声":"FEMALE".equals(vocal)?"女声":null;body.put("description",voice==null?styleDescription:String.join("，",styleDescription,voice));}
  JsonNode response=client.post().uri(path).header("Authorization","Bearer "+key).contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class);return songs(response);
 }
 public List<ProviderSong> query(Collection<String> ids){Map<String,Object> body=Map.of("model",model,"song_ids",String.join(",",ids));JsonNode response=client.post().uri("/api/music/query").header("Authorization","Bearer "+key).contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(JsonNode.class);return songs(response);}
 private List<ProviderSong> songs(JsonNode response){
  List<JsonNode> nodes=new ArrayList<>(); collectSongNodes(response,nodes);
  List<ProviderSong> out=new ArrayList<>();
  for(JsonNode n:nodes){String id=text(n,"song_id",text(n,"id",null));if(id==null||id.isBlank())continue;out.add(new ProviderSong(id,text(n,"song_title",text(n,"title","未命名作品")),text(n,"status","pending"),text(n,"audio_url",null),text(n,"cover_url",text(n,"image_url",null)),text(n,"lyrics",null),text(n,"style_tags",null),decimal(n,"duration"),text(n,"model_version",text(n,"model",model)),text(n,"error_message",null)));}
  return out;
 }
 private void collectSongNodes(JsonNode node,List<JsonNode> out){
  if(node==null||node.isNull())return;
  if(node.isArray()){for(JsonNode child:node)collectSongNodes(child,out);return;}
  if(!node.isObject())return;
  if(node.has("song_id")||node.has("audio_url")||node.has("cover_url")){out.add(node);return;}
  for(String key:List.of("data","songs","items","clips","tasks","results","song","clip")){if(node.has(key))collectSongNodes(node.get(key),out);}
 }
 private String text(JsonNode n,String k,String fallback){JsonNode v=n.get(k);return v==null||v.isNull()?fallback:v.asText();} private BigDecimal decimal(JsonNode n,String k){return n.hasNonNull(k)?n.get(k).decimalValue():null;}
 public record ProviderSong(String id,String title,String status,String audioUrl,String coverUrl,String lyrics,String styleTags,BigDecimal duration,String model,String error){}
}
