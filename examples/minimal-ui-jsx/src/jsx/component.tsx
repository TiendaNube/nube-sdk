import type {
  NubeComponent,
  NubeComponentBox,
  NubeComponentBoxProps,
  NubeComponentCol,
  NubeComponentColProps,
  NubeComponentFieldProps,
  NubeComponentImg,
  NubeComponentImgProps,
  NubeComponentRow,
  NubeComponentRowProps,
  NubeComponentTxt,
  NubeComponentTxtProps,
} from "@tiendanube/nube-sdk-types";
import { box, col, field, img, row, txt } from "@tiendanube/nube-sdk-ui";

export function Box(props: NubeComponentBoxProps): NubeComponentBox {
  return box(props)
}

export function Col(props: NubeComponentColProps): NubeComponentCol {
  return col(props)
}

export function Row(props: NubeComponentRowProps): NubeComponentRow {
  return row(props)
}

export function Field(props: NubeComponentFieldProps): NubeComponent {
  return field(props)
}

export function Txt(props: NubeComponentTxtProps): NubeComponentTxt {
  return txt(props)
}

export function Img(props: NubeComponentImgProps): NubeComponentImg {
  return img(props)
}

