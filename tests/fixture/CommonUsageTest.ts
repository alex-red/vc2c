import Vue from 'vue'
import { Prop, Component, Watch } from 'vue-property-decorator'

/**
 * My basic tag
 */
@Component({
  name: 'general-usage',
  template: "#test-template"
})
export default class BasicPropertyClass extends Vue {
  /**
   * My foo
   */
  @Prop({ type: Number, default: false }) 
  public aProperty!: number;

  @Prop()
  public propWithNothing!: string;

  /**
   * My msg
   */
  public msg = 'Vetur means "Winter" in icelandic.'

  /**
   * Computed
   */
  public get computedGetterOnly (): number {
    return this.aProperty + 1;
  }

  public get computedGetterSetter () {
    return this.propWithNothing + "-appended";
  }

  public set computedGetterSetter (value: string) {
    this.$emit('change', value)
  }

  @Watch('computedGetterOnly', { deep: true, immediate: true })
  onCheckedChanged (val: number, oldVal: number | undefined) {
    console.log(val, oldVal)
  }

  @Watch('msg')
  onMsgChanged (val: string, oldVal: string) {
    console.log(val, oldVal)
  }

  mounted () {
    this.msg = "Changed";
  }

  created () {
    this.hello();
  }

  beforeDestroy() {
    this.$emit('tearing down')
  }

  destroyed() {
    console.log('destroyed')
  }

  /**
   * My greeting
   */
  hello () {
    console.log(this.msg)
  }
}